export enum FeatureFlag {
  PasswordlessLogin = "passwordless-login",
  AutofillV2 = "autofill-v2",
  AutofillOverlay = "autofill-overlay",
  BrowserFilelessImport = "browser-fileless-import",
  ItemShare = "item-share",
  FlexibleCollectionsV1 = "flexible-collections-v-1", // v-1 is intentional
  BulkCollectionAccess = "bulk-collection-access",
  KeyRotationImprovements = "key-rotation-improvements",
  FlexibleCollectionsMigration = "flexible-collections-migration",
}

// Replace this with a type safe lookup of the feature flag values in PM-2282
export type FeatureFlagValue = number | string | boolean;
