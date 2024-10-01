use std::path::PathBuf;

use interprocess::local_socket::{
    tokio::{prelude::*, Stream},
    GenericFilePath, ToFsName,
};
use log::{error, info};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

use crate::ipc::NATIVE_MESSAGING_BUFFER_SIZE;

pub async fn connect(
    path: PathBuf,
    send: tokio::sync::mpsc::Sender<String>,
    mut recv: tokio::sync::mpsc::Receiver<String>,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Attempting to connect to {}", path.display());

    let name = path.as_os_str().to_fs_name::<GenericFilePath>()?;
    let mut conn = Stream::connect(name).await?;

    info!("Connected to {}", path.display());

    // This `connected` and the latter `disconnected` messages are the only ones that
    // are sent from the Rust IPC code and not just forwarded from the desktop app.
    // As it's only two, we hardcode the JSON values to avoid pulling in a JSON library.
    send.send("{\"command\":\"connected\"}".to_owned()).await?;

    let mut buffer = vec![0; NATIVE_MESSAGING_BUFFER_SIZE];

    // Listen to IPC messages
    loop {
        tokio::select! {
            // Forward messages to the IPC server
            msg = recv.recv() => {
                match msg {
                    Some(msg) => {
                        conn.write_all(msg.as_bytes()).await?;
                    }
                    None => {
                        info!("Client channel closed");
                        break;
                    },
                }
            },

            // Forward messages from the IPC server
            res = conn.read(&mut buffer[..]) => {
                match res {
                    Err(e) => {
                        error!("Error reading from IPC server: {e}");
                        break;
                    }
                    Ok(0) => {
                        info!("Connection closed");
                        break;
                    }
                    Ok(n) => {
                        let message = String::from_utf8_lossy(&buffer[..n]).to_string();
                        send.send(message).await?;
                    }
                }
            }
        }
    }

    let _ = send.send("{\"command\":\"disconnected\"}".to_owned()).await;

    Ok(())
}
