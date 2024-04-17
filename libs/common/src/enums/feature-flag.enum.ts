export enum FeatureFlag {
  BrowserFilelessImport = "browser-fileless-import",
  ItemShare = "item-share",
  FlexibleCollectionsV1 = "flexible-collections-v-1", // v-1 is intentional
  VaultOnboarding = "vault-onboarding",
  GeneratorToolsModernization = "generator-tools-modernization",
  KeyRotationImprovements = "key-rotation-improvements",
  FlexibleCollectionsMigration = "flexible-collections-migration",
  ShowPaymentMethodWarningBanners = "show-payment-method-warning-banners",
  EnableConsolidatedBilling = "enable-consolidated-billing",
  AC1795_UpdatedSubscriptionStatusSection = "AC-1795_updated-subscription-status-section",
  UnassignedItemsBanner = "unassigned-items-banner",
  EnableDeleteProvider = "AC-1218-delete-provider",
}

// Replace this with a type safe lookup of the feature flag values in PM-2282
export type FeatureFlagValue = number | string | boolean;
