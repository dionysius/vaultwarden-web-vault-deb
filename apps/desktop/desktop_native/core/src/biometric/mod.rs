use anyhow::Result;

#[cfg_attr(target_os = "linux", path = "unix.rs")]
#[cfg_attr(target_os = "windows", path = "windows.rs")]
#[cfg_attr(target_os = "macos", path = "macos.rs")]
mod biometric;

pub use biometric::Biometric;

pub struct KeyMaterial {
    pub os_key_part_b64: String,
    pub client_key_part_b64: Option<String>,
}

pub struct OsDerivedKey {
    pub key_b64: String,
    pub iv_b64: String,
}

pub trait BiometricTrait {
    fn prompt(hwnd: Vec<u8>, message: String) -> Result<bool>;
    fn available() -> Result<bool>;
    fn derive_key_material(secret: Option<&str>) -> Result<OsDerivedKey>;
    fn set_biometric_secret(
        service: &str,
        account: &str,
        secret: &str,
        key_material: Option<KeyMaterial>,
        iv_b64: &str,
    ) -> Result<String>;
    fn get_biometric_secret(
        service: &str,
        account: &str,
        key_material: Option<KeyMaterial>,
    ) -> Result<String>;
}
