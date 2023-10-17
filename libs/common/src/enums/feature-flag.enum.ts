export enum FeatureFlag {
  DisplayEuEnvironmentFlag = "display-eu-environment",
  DisplayLowKdfIterationWarningFlag = "display-kdf-iteration-warning",
  Fido2VaultCredentials = "fido2-vault-credentials",
  TrustedDeviceEncryption = "trusted-device-encryption",
  PasswordlessLogin = "passwordless-login",
  AutofillV2 = "autofill-v2",
  BrowserFilelessImport = "browser-fileless-import",
}

// Replace this with a type safe lookup of the feature flag values in PM-2282
export type FeatureFlagValue = number | string | boolean;
