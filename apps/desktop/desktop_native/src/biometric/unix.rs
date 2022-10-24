use anyhow::{bail, Result};

pub fn prompt(_hwnd: Vec<u8>, _message: String) -> Result<bool> {
    bail!("platform not supported");
}

pub fn available() -> Result<bool> {
    bail!("platform not supported");
}
