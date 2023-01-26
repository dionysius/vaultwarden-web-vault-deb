import { NgModule } from "@angular/core";

import { AcceptEmergencyComponent } from "../accounts/accept-emergency.component";
import { AcceptOrganizationComponent } from "../accounts/accept-organization.component";
import { HintComponent } from "../accounts/hint.component";
import { LockComponent } from "../accounts/lock.component";
import { RecoverDeleteComponent } from "../accounts/recover-delete.component";
import { RecoverTwoFactorComponent } from "../accounts/recover-two-factor.component";
import { RegisterFormModule } from "../accounts/register-form/register-form.module";
import { RemovePasswordComponent } from "../accounts/remove-password.component";
import { SetPasswordComponent } from "../accounts/set-password.component";
import { SsoComponent } from "../accounts/sso.component";
import { TwoFactorOptionsComponent } from "../accounts/two-factor-options.component";
import { TwoFactorComponent } from "../accounts/two-factor.component";
import { UpdatePasswordComponent } from "../accounts/update-password.component";
import { UpdateTempPasswordComponent } from "../accounts/update-temp-password.component";
import { VerifyEmailTokenComponent } from "../accounts/verify-email-token.component";
import { VerifyRecoverDeleteComponent } from "../accounts/verify-recover-delete.component";
import { DynamicAvatarComponent } from "../components/dynamic-avatar.component";
import { OrganizationSwitcherComponent } from "../components/organization-switcher.component";
import { PasswordRepromptComponent } from "../components/password-reprompt.component";
import { PremiumBadgeComponent } from "../components/premium-badge.component";
import { SelectableAvatarComponent } from "../components/selectable-avatar.component";
import { UserVerificationPromptComponent } from "../components/user-verification-prompt.component";
import { UserVerificationComponent } from "../components/user-verification.component";
import { FooterComponent } from "../layouts/footer.component";
import { FrontendLayoutComponent } from "../layouts/frontend-layout.component";
import { NavbarComponent } from "../layouts/navbar.component";
import { ProductSwitcherModule } from "../layouts/product-switcher/product-switcher.module";
import { UserLayoutComponent } from "../layouts/user-layout.component";
import { OrganizationCreateModule } from "../organizations/create/organization-create.module";
import { OrganizationLayoutComponent } from "../organizations/layouts/organization-layout.component";
import { CollectionsComponent as OrgManageCollectionsComponent } from "../organizations/manage/collections.component";
import { EntityEventsComponent as OrgEntityEventsComponent } from "../organizations/manage/entity-events.component";
import { EventsComponent as OrgEventsComponent } from "../organizations/manage/events.component";
import { ManageComponent as OrgManageComponent } from "../organizations/manage/manage.component";
import { UserConfirmComponent as OrgUserConfirmComponent } from "../organizations/manage/user-confirm.component";
import { AcceptFamilySponsorshipComponent } from "../organizations/sponsorships/accept-family-sponsorship.component";
import { FamiliesForEnterpriseSetupComponent } from "../organizations/sponsorships/families-for-enterprise-setup.component";
import { ExposedPasswordsReportComponent as OrgExposedPasswordsReportComponent } from "../organizations/tools/exposed-passwords-report.component";
import { InactiveTwoFactorReportComponent as OrgInactiveTwoFactorReportComponent } from "../organizations/tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent as OrgReusedPasswordsReportComponent } from "../organizations/tools/reused-passwords-report.component";
import { ToolsComponent as OrgToolsComponent } from "../organizations/tools/tools.component";
import { UnsecuredWebsitesReportComponent as OrgUnsecuredWebsitesReportComponent } from "../organizations/tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent as OrgWeakPasswordsReportComponent } from "../organizations/tools/weak-passwords-report.component";
import { AddEditComponent as OrgAddEditComponent } from "../organizations/vault/add-edit.component";
import { AttachmentsComponent as OrgAttachmentsComponent } from "../organizations/vault/attachments.component";
import { CollectionsComponent as OrgCollectionsComponent } from "../organizations/vault/collections.component";
import { ProvidersComponent } from "../providers/providers.component";
import { AccessComponent } from "../send/access.component";
import { AddEditComponent as SendAddEditComponent } from "../send/add-edit.component";
import { EffluxDatesComponent as SendEffluxDatesComponent } from "../send/efflux-dates.component";
import { SendComponent } from "../send/send.component";
import { AccountComponent } from "../settings/account.component";
import { AddCreditComponent } from "../settings/add-credit.component";
import { AdjustPaymentComponent } from "../settings/adjust-payment.component";
import { AdjustStorageComponent } from "../settings/adjust-storage.component";
import { ApiKeyComponent } from "../settings/api-key.component";
import { BillingHistoryViewComponent } from "../settings/billing-history-view.component";
import { BillingHistoryComponent } from "../settings/billing-history.component";
import { BillingSyncKeyComponent } from "../settings/billing-sync-key.component";
import { ChangeAvatarComponent } from "../settings/change-avatar.component";
import { ChangeEmailComponent } from "../settings/change-email.component";
import { ChangeKdfComponent } from "../settings/change-kdf.component";
import { ChangePasswordComponent } from "../settings/change-password.component";
import { CreateOrganizationComponent } from "../settings/create-organization.component";
import { DeauthorizeSessionsComponent } from "../settings/deauthorize-sessions.component";
import { DeleteAccountComponent } from "../settings/delete-account.component";
import { DomainRulesComponent } from "../settings/domain-rules.component";
import { EmergencyAccessAddEditComponent } from "../settings/emergency-access-add-edit.component";
import { EmergencyAccessAttachmentsComponent } from "../settings/emergency-access-attachments.component";
import { EmergencyAccessConfirmComponent } from "../settings/emergency-access-confirm.component";
import { EmergencyAccessTakeoverComponent } from "../settings/emergency-access-takeover.component";
import { EmergencyAccessViewComponent } from "../settings/emergency-access-view.component";
import { EmergencyAccessComponent } from "../settings/emergency-access.component";
import { EmergencyAddEditComponent } from "../settings/emergency-add-edit.component";
import { LowKdfComponent } from "../settings/low-kdf.component";
import { OrganizationPlansComponent } from "../settings/organization-plans.component";
import { PaymentMethodComponent } from "../settings/payment-method.component";
import { PaymentComponent } from "../settings/payment.component";
import { PreferencesComponent } from "../settings/preferences.component";
import { PremiumComponent } from "../settings/premium.component";
import { ProfileComponent } from "../settings/profile.component";
import { PurgeVaultComponent } from "../settings/purge-vault.component";
import { SecurityKeysComponent } from "../settings/security-keys.component";
import { SecurityComponent } from "../settings/security.component";
import { SettingsComponent } from "../settings/settings.component";
import { SponsoredFamiliesComponent } from "../settings/sponsored-families.component";
import { SponsoringOrgRowComponent } from "../settings/sponsoring-org-row.component";
import { SubscriptionComponent } from "../settings/subscription.component";
import { TaxInfoComponent } from "../settings/tax-info.component";
import { TwoFactorAuthenticatorComponent } from "../settings/two-factor-authenticator.component";
import { TwoFactorDuoComponent } from "../settings/two-factor-duo.component";
import { TwoFactorEmailComponent } from "../settings/two-factor-email.component";
import { TwoFactorRecoveryComponent } from "../settings/two-factor-recovery.component";
import { TwoFactorSetupComponent } from "../settings/two-factor-setup.component";
import { TwoFactorVerifyComponent } from "../settings/two-factor-verify.component";
import { TwoFactorWebAuthnComponent } from "../settings/two-factor-webauthn.component";
import { TwoFactorYubiKeyComponent } from "../settings/two-factor-yubikey.component";
import { UpdateKeyComponent } from "../settings/update-key.component";
import { UpdateLicenseComponent } from "../settings/update-license.component";
import { UserSubscriptionComponent } from "../settings/user-subscription.component";
import { VaultTimeoutInputComponent } from "../settings/vault-timeout-input.component";
import { VerifyEmailComponent } from "../settings/verify-email.component";
import { GeneratorComponent } from "../tools/generator.component";
import { PasswordGeneratorHistoryComponent } from "../tools/password-generator-history.component";
import { ToolsComponent } from "../tools/tools.component";
import { AddEditCustomFieldsComponent } from "../vault/add-edit-custom-fields.component";
import { AddEditComponent } from "../vault/add-edit.component";
import { AttachmentsComponent } from "../vault/attachments.component";
import { CollectionsComponent } from "../vault/collections.component";
import { FolderAddEditComponent } from "../vault/folder-add-edit.component";
import { ShareComponent } from "../vault/share.component";

import { SharedModule } from "./shared.module";

// Please do not add to this list of declarations - we should refactor these into modules when doing so makes sense until there are none left.
// If you are building new functionality, please create or extend a feature module instead.
@NgModule({
  imports: [SharedModule, OrganizationCreateModule, RegisterFormModule, ProductSwitcherModule],
  declarations: [
    PremiumBadgeComponent,
    AcceptEmergencyComponent,
    AcceptFamilySponsorshipComponent,
    AcceptOrganizationComponent,
    AccessComponent,
    AccountComponent,
    AddCreditComponent,
    AddEditComponent,
    AddEditCustomFieldsComponent,
    AddEditCustomFieldsComponent,
    AdjustPaymentComponent,
    AdjustStorageComponent,
    ApiKeyComponent,
    AttachmentsComponent,
    BillingSyncKeyComponent,
    ChangeEmailComponent,
    ChangeKdfComponent,
    ChangePasswordComponent,
    CollectionsComponent,
    CreateOrganizationComponent,
    DeauthorizeSessionsComponent,
    DeleteAccountComponent,
    DomainRulesComponent,
    DynamicAvatarComponent,
    EmergencyAccessAddEditComponent,
    EmergencyAccessAttachmentsComponent,
    EmergencyAccessComponent,
    EmergencyAccessConfirmComponent,
    EmergencyAccessTakeoverComponent,
    EmergencyAccessViewComponent,
    EmergencyAddEditComponent,
    FamiliesForEnterpriseSetupComponent,
    FolderAddEditComponent,
    FooterComponent,
    FrontendLayoutComponent,
    HintComponent,
    LockComponent,
    NavbarComponent,
    OrganizationSwitcherComponent,
    OrgAddEditComponent,
    OrganizationLayoutComponent,
    OrganizationPlansComponent,
    OrgAttachmentsComponent,
    OrgCollectionsComponent,
    OrgEntityEventsComponent,
    OrgEventsComponent,
    OrgExposedPasswordsReportComponent,
    OrgInactiveTwoFactorReportComponent,
    OrgManageCollectionsComponent,
    OrgManageComponent,
    OrgReusedPasswordsReportComponent,
    OrgToolsComponent,
    OrgUnsecuredWebsitesReportComponent,
    OrgUserConfirmComponent,
    OrgWeakPasswordsReportComponent,
    GeneratorComponent,
    PasswordGeneratorHistoryComponent,
    PasswordRepromptComponent,
    UserVerificationPromptComponent,
    PaymentComponent,
    PaymentMethodComponent,
    PreferencesComponent,
    PremiumBadgeComponent,
    PremiumComponent,
    ProfileComponent,
    ChangeAvatarComponent,
    ProvidersComponent,
    PurgeVaultComponent,
    RecoverDeleteComponent,
    RecoverTwoFactorComponent,
    RemovePasswordComponent,
    SecurityComponent,
    SecurityKeysComponent,
    SelectableAvatarComponent,
    SendAddEditComponent,
    SendComponent,
    SendEffluxDatesComponent,
    SetPasswordComponent,
    SettingsComponent,
    ShareComponent,
    SponsoredFamiliesComponent,
    SponsoringOrgRowComponent,
    SsoComponent,
    SubscriptionComponent,
    TaxInfoComponent,
    ToolsComponent,
    TwoFactorAuthenticatorComponent,
    TwoFactorComponent,
    TwoFactorDuoComponent,
    TwoFactorEmailComponent,
    TwoFactorOptionsComponent,
    TwoFactorRecoveryComponent,
    TwoFactorSetupComponent,
    TwoFactorVerifyComponent,
    TwoFactorWebAuthnComponent,
    TwoFactorYubiKeyComponent,
    UpdateKeyComponent,
    UpdateLicenseComponent,
    UpdatePasswordComponent,
    UpdateTempPasswordComponent,
    BillingHistoryComponent,
    BillingHistoryViewComponent,
    UserLayoutComponent,
    UserSubscriptionComponent,
    UserVerificationComponent,
    VaultTimeoutInputComponent,
    VerifyEmailComponent,
    VerifyEmailTokenComponent,
    VerifyRecoverDeleteComponent,
    LowKdfComponent,
  ],
  exports: [
    PremiumBadgeComponent,
    AcceptEmergencyComponent,
    AcceptOrganizationComponent,
    AccessComponent,
    AccountComponent,
    AddCreditComponent,
    AddEditComponent,
    AddEditCustomFieldsComponent,
    AddEditCustomFieldsComponent,
    AdjustPaymentComponent,
    AdjustStorageComponent,
    ApiKeyComponent,
    AttachmentsComponent,
    ChangeEmailComponent,
    ChangeKdfComponent,
    ChangePasswordComponent,
    CollectionsComponent,
    CreateOrganizationComponent,
    DeauthorizeSessionsComponent,
    DeleteAccountComponent,
    DomainRulesComponent,
    DynamicAvatarComponent,
    EmergencyAccessAddEditComponent,
    EmergencyAccessAttachmentsComponent,
    EmergencyAccessComponent,
    EmergencyAccessConfirmComponent,
    EmergencyAccessTakeoverComponent,
    EmergencyAccessViewComponent,
    EmergencyAddEditComponent,
    FamiliesForEnterpriseSetupComponent,
    FolderAddEditComponent,
    FooterComponent,
    FrontendLayoutComponent,
    HintComponent,
    LockComponent,
    NavbarComponent,
    OrganizationSwitcherComponent,
    OrgAddEditComponent,
    OrganizationLayoutComponent,
    OrganizationPlansComponent,
    OrgAttachmentsComponent,
    OrgCollectionsComponent,
    OrgEntityEventsComponent,
    OrgEventsComponent,
    OrgExposedPasswordsReportComponent,
    OrgInactiveTwoFactorReportComponent,
    OrgManageCollectionsComponent,
    OrgManageComponent,
    OrgReusedPasswordsReportComponent,
    OrgToolsComponent,
    OrgUnsecuredWebsitesReportComponent,
    OrgUserConfirmComponent,
    OrgWeakPasswordsReportComponent,
    GeneratorComponent,
    PasswordGeneratorHistoryComponent,
    PasswordRepromptComponent,
    PaymentComponent,
    PaymentMethodComponent,
    PreferencesComponent,
    PremiumBadgeComponent,
    PremiumComponent,
    ProfileComponent,
    ChangeAvatarComponent,
    ProvidersComponent,
    PurgeVaultComponent,
    RecoverDeleteComponent,
    RecoverTwoFactorComponent,
    RemovePasswordComponent,
    SecurityComponent,
    SecurityKeysComponent,
    SelectableAvatarComponent,
    SendAddEditComponent,
    SendComponent,
    SendEffluxDatesComponent,
    SetPasswordComponent,
    SettingsComponent,
    ShareComponent,
    SponsoredFamiliesComponent,
    SponsoringOrgRowComponent,
    SsoComponent,
    SubscriptionComponent,
    TaxInfoComponent,
    ToolsComponent,
    TwoFactorAuthenticatorComponent,
    TwoFactorComponent,
    TwoFactorDuoComponent,
    TwoFactorEmailComponent,
    TwoFactorOptionsComponent,
    TwoFactorRecoveryComponent,
    TwoFactorSetupComponent,
    TwoFactorVerifyComponent,
    TwoFactorWebAuthnComponent,
    TwoFactorYubiKeyComponent,
    UpdateKeyComponent,
    UpdateLicenseComponent,
    UpdatePasswordComponent,
    UpdateTempPasswordComponent,
    BillingHistoryComponent,
    BillingHistoryViewComponent,
    UserLayoutComponent,
    UserSubscriptionComponent,
    UserVerificationComponent,
    VaultTimeoutInputComponent,
    VerifyEmailComponent,
    VerifyEmailTokenComponent,
    VerifyRecoverDeleteComponent,
    LowKdfComponent,
  ],
})
export class LooseComponentsModule {}
