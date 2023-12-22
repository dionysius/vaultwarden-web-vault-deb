export enum FeatureFlag {
  DisplayLowKdfIterationWarningFlag = "display-kdf-iteration-warning",
  Fido2VaultCredentials = "fido2-vault-credentials",
  TrustedDeviceEncryption = "trusted-device-encryption",
  PasswordlessLogin = "passwordless-login",
  AutofillV2 = "autofill-v2",
  AutofillOverlay = "autofill-overlay",
  BrowserFilelessImport = "browser-fileless-import",
  ItemShare = "item-share",
  FlexibleCollections = "flexible-collections",
  FlexibleCollectionsV1 = "flexible-collections-v-1", // v-1 is intentional
  BulkCollectionAccess = "bulk-collection-access",
  KeyRotationImprovements = "key-rotation-improvements",
}

// Replace this with a type safe lookup of the feature flag values in PM-2282
export type FeatureFlagValue = number | string | boolean;
