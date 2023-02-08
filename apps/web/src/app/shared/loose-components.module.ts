import { NgModule } from "@angular/core";

import { PasswordRepromptComponent } from "../../../src/vault/components/password-reprompt.component";
import { AcceptEmergencyComponent } from "../../auth/accept-emergency.component";
import { AcceptOrganizationComponent } from "../../auth/accept-organization.component";
import { HintComponent } from "../../auth/hint.component";
import { LockComponent } from "../../auth/lock.component";
import { RecoverDeleteComponent } from "../../auth/recover-delete.component";
import { RecoverTwoFactorComponent } from "../../auth/recover-two-factor.component";
import { RegisterFormModule } from "../../auth/register-form/register-form.module";
import { RemovePasswordComponent } from "../../auth/remove-password.component";
import { SetPasswordComponent } from "../../auth/set-password.component";
import { DeauthorizeSessionsComponent } from "../../auth/settings/deauthorize-sessions.component";
import { EmergencyAccessAddEditComponent } from "../../auth/settings/emergency-access/emergency-access-add-edit.component";
import { EmergencyAccessAttachmentsComponent } from "../../auth/settings/emergency-access/emergency-access-attachments.component";
import { EmergencyAccessConfirmComponent } from "../../auth/settings/emergency-access/emergency-access-confirm.component";
import { EmergencyAccessTakeoverComponent } from "../../auth/settings/emergency-access/emergency-access-takeover.component";
import { EmergencyAccessViewComponent } from "../../auth/settings/emergency-access/emergency-access-view.component";
import { EmergencyAccessComponent } from "../../auth/settings/emergency-access/emergency-access.component";
import { EmergencyAddEditComponent } from "../../auth/settings/emergency-access/emergency-add-edit.component";
import { TwoFactorAuthenticatorComponent } from "../../auth/settings/two-factor-authenticator.component";
import { TwoFactorDuoComponent } from "../../auth/settings/two-factor-duo.component";
import { TwoFactorEmailComponent } from "../../auth/settings/two-factor-email.component";
import { TwoFactorRecoveryComponent } from "../../auth/settings/two-factor-recovery.component";
import { TwoFactorSetupComponent } from "../../auth/settings/two-factor-setup.component";
import { TwoFactorVerifyComponent } from "../../auth/settings/two-factor-verify.component";
import { TwoFactorWebAuthnComponent } from "../../auth/settings/two-factor-webauthn.component";
import { TwoFactorYubiKeyComponent } from "../../auth/settings/two-factor-yubikey.component";
import { VerifyEmailComponent } from "../../auth/settings/verify-email.component";
import { SsoComponent } from "../../auth/sso.component";
import { TwoFactorOptionsComponent } from "../../auth/two-factor-options.component";
import { TwoFactorComponent } from "../../auth/two-factor.component";
import { UpdatePasswordComponent } from "../../auth/update-password.component";
import { UpdateTempPasswordComponent } from "../../auth/update-temp-password.component";
import { VerifyEmailTokenComponent } from "../../auth/verify-email-token.component";
import { VerifyRecoverDeleteComponent } from "../../auth/verify-recover-delete.component";
import { PremiumBadgeComponent } from "../../vault/components/premium-badge.component";
import { AddEditCustomFieldsComponent } from "../../vault/individual-vault/add-edit-custom-fields.component";
import { AddEditComponent } from "../../vault/individual-vault/add-edit.component";
import { AttachmentsComponent } from "../../vault/individual-vault/attachments.component";
import { CollectionsComponent } from "../../vault/individual-vault/collections.component";
import { FolderAddEditComponent } from "../../vault/individual-vault/folder-add-edit.component";
import { ShareComponent } from "../../vault/individual-vault/share.component";
import { AddEditComponent as OrgAddEditComponent } from "../../vault/org-vault/add-edit.component";
import { AttachmentsComponent as OrgAttachmentsComponent } from "../../vault/org-vault/attachments.component";
import { DynamicAvatarComponent } from "../components/dynamic-avatar.component";
import { OrganizationSwitcherComponent } from "../components/organization-switcher.component";
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
import { DeleteAccountComponent } from "../settings/delete-account.component";
import { DomainRulesComponent } from "../settings/domain-rules.component";
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
import { UpdateKeyComponent } from "../settings/update-key.component";
import { UpdateLicenseComponent } from "../settings/update-license.component";
import { UserSubscriptionComponent } from "../settings/user-subscription.component";
import { VaultTimeoutInputComponent } from "../settings/vault-timeout-input.component";
import { GeneratorComponent } from "../tools/generator.component";
import { PasswordGeneratorHistoryComponent } from "../tools/password-generator-history.component";
import { ToolsComponent } from "../tools/tools.component";

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
