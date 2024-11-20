use std::{
    io, pin::Pin, sync::Arc, task::{Context, Poll}
};

use futures::Stream;
use tokio::{
    net::windows::named_pipe::{NamedPipeServer, ServerOptions},
    select,
};
use tokio_util::sync::CancellationToken;

const PIPE_NAME: &str = r"\\.\pipe\openssh-ssh-agent";

#[pin_project::pin_project]
pub struct NamedPipeServerStream {
    rx: tokio::sync::mpsc::Receiver<NamedPipeServer>,
}

impl NamedPipeServerStream {
    pub fn new(cancellation_token: CancellationToken, is_running: Arc<tokio::sync::Mutex<bool>>) -> Self {
        let (tx, rx) = tokio::sync::mpsc::channel(16);
        tokio::spawn(async move {
            println!(
                "[SSH Agent Native Module] Creating named pipe server on {}",
                PIPE_NAME
            );
            let mut listener = match ServerOptions::new().create(PIPE_NAME) {
                Ok(pipe) => pipe,
                Err(err) => {
                    println!("[SSH Agent Native Module] Encountered an error creating the first pipe. The system's openssh service must likely be disabled");
                    println!("[SSH Agent Natvie Module] error: {}", err);
                    cancellation_token.cancel();
                    *is_running.lock().await = false;
                    return;
                }
            };
            loop {
                println!("[SSH Agent Native Module] Waiting for connection");
                select! {
                    _ = cancellation_token.cancelled() => {
                        println!("[SSH Agent Native Module] Cancellation token triggered, stopping named pipe server");
                        break;
                    }
                    _ = listener.connect() => {
                        println!("[SSH Agent Native Module] Incoming connection");
                        tx.send(listener).await.unwrap();

                        listener = match ServerOptions::new().create(PIPE_NAME) {
                            Ok(pipe) => pipe,
                            Err(err) => {
                                println!("[SSH Agent Native Module] Encountered an error creating a new pipe {}", err);
                                cancellation_token.cancel();
                                *is_running.lock().await = false;
                                return;
                            }
                        };
                    }
                }
            }
        });
        Self { rx }
    }
}

impl Stream for NamedPipeServerStream {
    type Item = io::Result<NamedPipeServer>;

    fn poll_next(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<io::Result<NamedPipeServer>>> {
        let this = self.project();

        this.rx.poll_recv(cx).map(|v| v.map(Ok))
    }
}
