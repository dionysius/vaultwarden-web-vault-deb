import { OrganizationConnectionType } from "../enums/organizationConnectionType";
import { SetKeyConnectorKeyRequest } from "../models/request/account/set-key-connector-key.request";
import { BitPayInvoiceRequest } from "../models/request/bit-pay-invoice.request";
import { CollectionBulkDeleteRequest } from "../models/request/collection-bulk-delete.request";
import { CollectionRequest } from "../models/request/collection.request";
import { DeleteRecoverRequest } from "../models/request/delete-recover.request";
import { DeviceVerificationRequest } from "../models/request/device-verification.request";
import { EmailTokenRequest } from "../models/request/email-token.request";
import { EmailRequest } from "../models/request/email.request";
import { EmergencyAccessAcceptRequest } from "../models/request/emergency-access-accept.request";
import { EmergencyAccessConfirmRequest } from "../models/request/emergency-access-confirm.request";
import { EmergencyAccessInviteRequest } from "../models/request/emergency-access-invite.request";
import { EmergencyAccessPasswordRequest } from "../models/request/emergency-access-password.request";
import { EmergencyAccessUpdateRequest } from "../models/request/emergency-access-update.request";
import { EventRequest } from "../models/request/event.request";
import { IapCheckRequest } from "../models/request/iap-check.request";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { KdfRequest } from "../models/request/kdf.request";
import { KeyConnectorUserKeyRequest } from "../models/request/key-connector-user-key.request";
import { KeysRequest } from "../models/request/keys.request";
import { OrganizationConnectionRequest } from "../models/request/organization-connection.request";
import { OrganizationImportRequest } from "../models/request/organization-import.request";
import { OrganizationSponsorshipCreateRequest } from "../models/request/organization/organization-sponsorship-create.request";
import { OrganizationSponsorshipRedeemRequest } from "../models/request/organization/organization-sponsorship-redeem.request";
import { PasswordHintRequest } from "../models/request/password-hint.request";
import { PasswordRequest } from "../models/request/password.request";
import { PasswordlessCreateAuthRequest } from "../models/request/passwordless-create-auth.request";
import { PaymentRequest } from "../models/request/payment.request";
import { PreloginRequest } from "../models/request/prelogin.request";
import { ProviderAddOrganizationRequest } from "../models/request/provider/provider-add-organization.request";
import { ProviderOrganizationCreateRequest } from "../models/request/provider/provider-organization-create.request";
import { ProviderSetupRequest } from "../models/request/provider/provider-setup.request";
import { ProviderUpdateRequest } from "../models/request/provider/provider-update.request";
import { ProviderUserAcceptRequest } from "../models/request/provider/provider-user-accept.request";
import { ProviderUserBulkConfirmRequest } from "../models/request/provider/provider-user-bulk-confirm.request";
import { ProviderUserBulkRequest } from "../models/request/provider/provider-user-bulk.request";
import { ProviderUserConfirmRequest } from "../models/request/provider/provider-user-confirm.request";
import { ProviderUserInviteRequest } from "../models/request/provider/provider-user-invite.request";
import { ProviderUserUpdateRequest } from "../models/request/provider/provider-user-update.request";
import { RegisterRequest } from "../models/request/register.request";
import { SecretVerificationRequest } from "../models/request/secret-verification.request";
import { SelectionReadOnlyRequest } from "../models/request/selection-read-only.request";
import { SendAccessRequest } from "../models/request/send-access.request";
import { SendRequest } from "../models/request/send.request";
import { SetPasswordRequest } from "../models/request/set-password.request";
import { StorageRequest } from "../models/request/storage.request";
import { TaxInfoUpdateRequest } from "../models/request/tax-info-update.request";
import { TwoFactorEmailRequest } from "../models/request/two-factor-email.request";
import { TwoFactorProviderRequest } from "../models/request/two-factor-provider.request";
import { TwoFactorRecoveryRequest } from "../models/request/two-factor-recovery.request";
import { UpdateAvatarRequest } from "../models/request/update-avatar.request";
import { UpdateDomainsRequest } from "../models/request/update-domains.request";
import { UpdateKeyRequest } from "../models/request/update-key.request";
import { UpdateProfileRequest } from "../models/request/update-profile.request";
import { UpdateTempPasswordRequest } from "../models/request/update-temp-password.request";
import { UpdateTwoFactorAuthenticatorRequest } from "../models/request/update-two-factor-authenticator.request";
import { UpdateTwoFactorDuoRequest } from "../models/request/update-two-factor-duo.request";
import { UpdateTwoFactorEmailRequest } from "../models/request/update-two-factor-email.request";
import { UpdateTwoFactorWebAuthnDeleteRequest } from "../models/request/update-two-factor-web-authn-delete.request";
import { UpdateTwoFactorWebAuthnRequest } from "../models/request/update-two-factor-web-authn.request";
import { UpdateTwoFactorYubioOtpRequest } from "../models/request/update-two-factor-yubio-otp.request";
import { VerifyDeleteRecoverRequest } from "../models/request/verify-delete-recover.request";
import { VerifyEmailRequest } from "../models/request/verify-email.request";
import { ApiKeyResponse } from "../models/response/api-key.response";
import { AuthRequestResponse } from "../models/response/auth-request.response";
import { RegisterResponse } from "../models/response/authentication/register.response";
import { BillingHistoryResponse } from "../models/response/billing-history.response";
import { BillingPaymentResponse } from "../models/response/billing-payment.response";
import { BreachAccountResponse } from "../models/response/breach-account.response";
import {
  CollectionAccessDetailsResponse,
  CollectionResponse,
} from "../models/response/collection.response";
import { DeviceVerificationResponse } from "../models/response/device-verification.response";
import { DomainsResponse } from "../models/response/domains.response";
import {
  EmergencyAccessGranteeDetailsResponse,
  EmergencyAccessGrantorDetailsResponse,
  EmergencyAccessTakeoverResponse,
  EmergencyAccessViewResponse,
} from "../models/response/emergency-access.response";
import { EventResponse } from "../models/response/event.response";
import { IdentityCaptchaResponse } from "../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../models/response/identity-two-factor.response";
import { KeyConnectorUserKeyResponse } from "../models/response/key-connector-user-key.response";
import { ListResponse } from "../models/response/list.response";
import {
  OrganizationConnectionConfigApis,
  OrganizationConnectionResponse,
} from "../models/response/organization-connection.response";
import { OrganizationExportResponse } from "../models/response/organization-export.response";
import { OrganizationSponsorshipSyncStatusResponse } from "../models/response/organization-sponsorship-sync-status.response";
import { PaymentResponse } from "../models/response/payment.response";
import { PlanResponse } from "../models/response/plan.response";
import { PolicyResponse } from "../models/response/policy.response";
import { PreloginResponse } from "../models/response/prelogin.response";
import { ProfileResponse } from "../models/response/profile.response";
import {
  ProviderOrganizationOrganizationDetailsResponse,
  ProviderOrganizationResponse,
} from "../models/response/provider/provider-organization.response";
import { ProviderUserBulkPublicKeyResponse } from "../models/response/provider/provider-user-bulk-public-key.response";
import { ProviderUserBulkResponse } from "../models/response/provider/provider-user-bulk.response";
import {
  ProviderUserResponse,
  ProviderUserUserDetailsResponse,
} from "../models/response/provider/provider-user.response";
import { ProviderResponse } from "../models/response/provider/provider.response";
import { SelectionReadOnlyResponse } from "../models/response/selection-read-only.response";
import { SendAccessResponse } from "../models/response/send-access.response";
import { SendFileDownloadDataResponse } from "../models/response/send-file-download-data.response";
import { SendFileUploadDataResponse } from "../models/response/send-file-upload-data.response";
import { SendResponse } from "../models/response/send.response";
import { SsoPreValidateResponse } from "../models/response/sso-pre-validate.response";
import { SubscriptionResponse } from "../models/response/subscription.response";
import { TaxInfoResponse } from "../models/response/tax-info.response";
import { TaxRateResponse } from "../models/response/tax-rate.response";
import { TwoFactorAuthenticatorResponse } from "../models/response/two-factor-authenticator.response";
import { TwoFactorDuoResponse } from "../models/response/two-factor-duo.response";
import { TwoFactorEmailResponse } from "../models/response/two-factor-email.response";
import { TwoFactorProviderResponse } from "../models/response/two-factor-provider.response";
import { TwoFactorRecoverResponse } from "../models/response/two-factor-recover.response";
import {
  ChallengeResponse,
  TwoFactorWebAuthnResponse,
} from "../models/response/two-factor-web-authn.response";
import { TwoFactorYubiKeyResponse } from "../models/response/two-factor-yubi-key.response";
import { UserKeyResponse } from "../models/response/user-key.response";
import { SendAccessView } from "../models/view/send-access.view";
import { AttachmentRequest } from "../vault/models/request/attachment.request";
import { CipherBulkDeleteRequest } from "../vault/models/request/cipher-bulk-delete.request";
import { CipherBulkMoveRequest } from "../vault/models/request/cipher-bulk-move.request";
import { CipherBulkRestoreRequest } from "../vault/models/request/cipher-bulk-restore.request";
import { CipherBulkShareRequest } from "../vault/models/request/cipher-bulk-share.request";
import { CipherCollectionsRequest } from "../vault/models/request/cipher-collections.request";
import { CipherCreateRequest } from "../vault/models/request/cipher-create.request";
import { CipherPartialRequest } from "../vault/models/request/cipher-partial.request";
import { CipherShareRequest } from "../vault/models/request/cipher-share.request";
import { CipherRequest } from "../vault/models/request/cipher.request";
import { AttachmentUploadDataResponse } from "../vault/models/response/attachment-upload-data.response";
import { AttachmentResponse } from "../vault/models/response/attachment.response";
import { CipherResponse } from "../vault/models/response/cipher.response";
import { SyncResponse } from "../vault/models/response/sync.response";

/**
 * @deprecated The `ApiService` class is deprecated and calls should be extracted into individual
 * api services. The `send` method is still allowed to be used within api services. For background
 * of this decision please read https://contributing.bitwarden.com/architecture/adr/refactor-api-service.
 */
export abstract class ApiService {
  send: (
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body: any,
    authed: boolean,
    hasResponse: boolean,
    apiUrl?: string,
    alterHeaders?: (headers: Headers) => void
  ) => Promise<any>;

  postIdentityToken: (
    request: PasswordTokenRequest | SsoTokenRequest | UserApiTokenRequest
  ) => Promise<IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse>;
  refreshIdentityToken: () => Promise<any>;

  getProfile: () => Promise<ProfileResponse>;
  getUserSubscription: () => Promise<SubscriptionResponse>;
  getTaxInfo: () => Promise<TaxInfoResponse>;
  putProfile: (request: UpdateProfileRequest) => Promise<ProfileResponse>;
  putAvatar: (request: UpdateAvatarRequest) => Promise<ProfileResponse>;
  putTaxInfo: (request: TaxInfoUpdateRequest) => Promise<any>;
  postPrelogin: (request: PreloginRequest) => Promise<PreloginResponse>;
  postEmailToken: (request: EmailTokenRequest) => Promise<any>;
  postEmail: (request: EmailRequest) => Promise<any>;
  postPassword: (request: PasswordRequest) => Promise<any>;
  setPassword: (request: SetPasswordRequest) => Promise<any>;
  postSetKeyConnectorKey: (request: SetKeyConnectorKeyRequest) => Promise<any>;
  postSecurityStamp: (request: SecretVerificationRequest) => Promise<any>;
  getAccountRevisionDate: () => Promise<number>;
  postPasswordHint: (request: PasswordHintRequest) => Promise<any>;
  postRegister: (request: RegisterRequest) => Promise<RegisterResponse>;
  postPremium: (data: FormData) => Promise<PaymentResponse>;
  postIapCheck: (request: IapCheckRequest) => Promise<any>;
  postReinstatePremium: () => Promise<any>;
  postCancelPremium: () => Promise<any>;
  postAccountStorage: (request: StorageRequest) => Promise<PaymentResponse>;
  postAccountPayment: (request: PaymentRequest) => Promise<void>;
  postAccountLicense: (data: FormData) => Promise<any>;
  postAccountKey: (request: UpdateKeyRequest) => Promise<any>;
  postAccountKeys: (request: KeysRequest) => Promise<any>;
  postAccountVerifyEmail: () => Promise<any>;
  postAccountVerifyEmailToken: (request: VerifyEmailRequest) => Promise<any>;
  postAccountVerifyPassword: (request: SecretVerificationRequest) => Promise<any>;
  postAccountRecoverDelete: (request: DeleteRecoverRequest) => Promise<any>;
  postAccountRecoverDeleteToken: (request: VerifyDeleteRecoverRequest) => Promise<any>;
  postAccountKdf: (request: KdfRequest) => Promise<any>;
  postUserApiKey: (id: string, request: SecretVerificationRequest) => Promise<ApiKeyResponse>;
  postUserRotateApiKey: (id: string, request: SecretVerificationRequest) => Promise<ApiKeyResponse>;
  putUpdateTempPassword: (request: UpdateTempPasswordRequest) => Promise<any>;
  postConvertToKeyConnector: () => Promise<void>;
  //passwordless
  postAuthRequest: (request: PasswordlessCreateAuthRequest) => Promise<AuthRequestResponse>;
  getAuthResponse: (id: string, accessCode: string) => Promise<AuthRequestResponse>;

  getUserBillingHistory: () => Promise<BillingHistoryResponse>;
  getUserBillingPayment: () => Promise<BillingPaymentResponse>;

  getSend: (id: string) => Promise<SendResponse>;
  postSendAccess: (
    id: string,
    request: SendAccessRequest,
    apiUrl?: string
  ) => Promise<SendAccessResponse>;
  getSends: () => Promise<ListResponse<SendResponse>>;
  postSend: (request: SendRequest) => Promise<SendResponse>;
  postFileTypeSend: (request: SendRequest) => Promise<SendFileUploadDataResponse>;
  postSendFile: (sendId: string, fileId: string, data: FormData) => Promise<any>;
  /**
   * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
   * This method still exists for backward compatibility with old server versions.
   */
  postSendFileLegacy: (data: FormData) => Promise<SendResponse>;
  putSend: (id: string, request: SendRequest) => Promise<SendResponse>;
  putSendRemovePassword: (id: string) => Promise<SendResponse>;
  deleteSend: (id: string) => Promise<any>;
  getSendFileDownloadData: (
    send: SendAccessView,
    request: SendAccessRequest,
    apiUrl?: string
  ) => Promise<SendFileDownloadDataResponse>;
  renewSendFileUploadUrl: (sendId: string, fileId: string) => Promise<SendFileUploadDataResponse>;

  getCipher: (id: string) => Promise<CipherResponse>;
  getFullCipherDetails: (id: string) => Promise<CipherResponse>;
  getCipherAdmin: (id: string) => Promise<CipherResponse>;
  getAttachmentData: (
    cipherId: string,
    attachmentId: string,
    emergencyAccessId?: string
  ) => Promise<AttachmentResponse>;
  getCiphersOrganization: (organizationId: string) => Promise<ListResponse<CipherResponse>>;
  postCipher: (request: CipherRequest) => Promise<CipherResponse>;
  postCipherCreate: (request: CipherCreateRequest) => Promise<CipherResponse>;
  postCipherAdmin: (request: CipherCreateRequest) => Promise<CipherResponse>;
  putCipher: (id: string, request: CipherRequest) => Promise<CipherResponse>;
  putPartialCipher: (id: string, request: CipherPartialRequest) => Promise<CipherResponse>;
  putCipherAdmin: (id: string, request: CipherRequest) => Promise<CipherResponse>;
  deleteCipher: (id: string) => Promise<any>;
  deleteCipherAdmin: (id: string) => Promise<any>;
  deleteManyCiphers: (request: CipherBulkDeleteRequest) => Promise<any>;
  deleteManyCiphersAdmin: (request: CipherBulkDeleteRequest) => Promise<any>;
  putMoveCiphers: (request: CipherBulkMoveRequest) => Promise<any>;
  putShareCipher: (id: string, request: CipherShareRequest) => Promise<CipherResponse>;
  putShareCiphers: (request: CipherBulkShareRequest) => Promise<any>;
  putCipherCollections: (id: string, request: CipherCollectionsRequest) => Promise<any>;
  putCipherCollectionsAdmin: (id: string, request: CipherCollectionsRequest) => Promise<any>;
  postPurgeCiphers: (request: SecretVerificationRequest, organizationId?: string) => Promise<any>;
  putDeleteCipher: (id: string) => Promise<any>;
  putDeleteCipherAdmin: (id: string) => Promise<any>;
  putDeleteManyCiphers: (request: CipherBulkDeleteRequest) => Promise<any>;
  putDeleteManyCiphersAdmin: (request: CipherBulkDeleteRequest) => Promise<any>;
  putRestoreCipher: (id: string) => Promise<CipherResponse>;
  putRestoreCipherAdmin: (id: string) => Promise<CipherResponse>;
  putRestoreManyCiphers: (
    request: CipherBulkRestoreRequest
  ) => Promise<ListResponse<CipherResponse>>;

  /**
   * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
   * This method still exists for backward compatibility with old server versions.
   */
  postCipherAttachmentLegacy: (id: string, data: FormData) => Promise<CipherResponse>;
  /**
   * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
   * This method still exists for backward compatibility with old server versions.
   */
  postCipherAttachmentAdminLegacy: (id: string, data: FormData) => Promise<CipherResponse>;
  postCipherAttachment: (
    id: string,
    request: AttachmentRequest
  ) => Promise<AttachmentUploadDataResponse>;
  deleteCipherAttachment: (id: string, attachmentId: string) => Promise<any>;
  deleteCipherAttachmentAdmin: (id: string, attachmentId: string) => Promise<any>;
  postShareCipherAttachment: (
    id: string,
    attachmentId: string,
    data: FormData,
    organizationId: string
  ) => Promise<any>;
  renewAttachmentUploadUrl: (
    id: string,
    attachmentId: string
  ) => Promise<AttachmentUploadDataResponse>;
  postAttachmentFile: (id: string, attachmentId: string, data: FormData) => Promise<any>;

  getUserCollections: () => Promise<ListResponse<CollectionResponse>>;
  getCollections: (organizationId: string) => Promise<ListResponse<CollectionResponse>>;
  getCollectionUsers: (organizationId: string, id: string) => Promise<SelectionReadOnlyResponse[]>;
  getCollectionAccessDetails: (
    organizationId: string,
    id: string
  ) => Promise<CollectionAccessDetailsResponse>;
  getManyCollectionsWithAccessDetails: (
    orgId: string
  ) => Promise<ListResponse<CollectionAccessDetailsResponse>>;
  postCollection: (
    organizationId: string,
    request: CollectionRequest
  ) => Promise<CollectionResponse>;
  putCollectionUsers: (
    organizationId: string,
    id: string,
    request: SelectionReadOnlyRequest[]
  ) => Promise<any>;
  putCollection: (
    organizationId: string,
    id: string,
    request: CollectionRequest
  ) => Promise<CollectionResponse>;
  deleteCollection: (organizationId: string, id: string) => Promise<any>;
  deleteManyCollections: (request: CollectionBulkDeleteRequest) => Promise<any>;
  deleteCollectionUser: (
    organizationId: string,
    id: string,
    organizationUserId: string
  ) => Promise<any>;

  getGroupUsers: (organizationId: string, id: string) => Promise<string[]>;
  putGroupUsers: (organizationId: string, id: string, request: string[]) => Promise<any>;
  deleteGroupUser: (organizationId: string, id: string, organizationUserId: string) => Promise<any>;

  getSync: () => Promise<SyncResponse>;
  postPublicImportDirectory: (request: OrganizationImportRequest) => Promise<any>;

  getSettingsDomains: () => Promise<DomainsResponse>;
  putSettingsDomains: (request: UpdateDomainsRequest) => Promise<DomainsResponse>;

  getTwoFactorProviders: () => Promise<ListResponse<TwoFactorProviderResponse>>;
  getTwoFactorOrganizationProviders: (
    organizationId: string
  ) => Promise<ListResponse<TwoFactorProviderResponse>>;
  getTwoFactorAuthenticator: (
    request: SecretVerificationRequest
  ) => Promise<TwoFactorAuthenticatorResponse>;
  getTwoFactorEmail: (request: SecretVerificationRequest) => Promise<TwoFactorEmailResponse>;
  getTwoFactorDuo: (request: SecretVerificationRequest) => Promise<TwoFactorDuoResponse>;
  getTwoFactorOrganizationDuo: (
    organizationId: string,
    request: SecretVerificationRequest
  ) => Promise<TwoFactorDuoResponse>;
  getTwoFactorYubiKey: (request: SecretVerificationRequest) => Promise<TwoFactorYubiKeyResponse>;
  getTwoFactorWebAuthn: (request: SecretVerificationRequest) => Promise<TwoFactorWebAuthnResponse>;
  getTwoFactorWebAuthnChallenge: (request: SecretVerificationRequest) => Promise<ChallengeResponse>;
  getTwoFactorRecover: (request: SecretVerificationRequest) => Promise<TwoFactorRecoverResponse>;
  putTwoFactorAuthenticator: (
    request: UpdateTwoFactorAuthenticatorRequest
  ) => Promise<TwoFactorAuthenticatorResponse>;
  putTwoFactorEmail: (request: UpdateTwoFactorEmailRequest) => Promise<TwoFactorEmailResponse>;
  putTwoFactorDuo: (request: UpdateTwoFactorDuoRequest) => Promise<TwoFactorDuoResponse>;
  putTwoFactorOrganizationDuo: (
    organizationId: string,
    request: UpdateTwoFactorDuoRequest
  ) => Promise<TwoFactorDuoResponse>;
  putTwoFactorYubiKey: (
    request: UpdateTwoFactorYubioOtpRequest
  ) => Promise<TwoFactorYubiKeyResponse>;
  putTwoFactorWebAuthn: (
    request: UpdateTwoFactorWebAuthnRequest
  ) => Promise<TwoFactorWebAuthnResponse>;
  deleteTwoFactorWebAuthn: (
    request: UpdateTwoFactorWebAuthnDeleteRequest
  ) => Promise<TwoFactorWebAuthnResponse>;
  putTwoFactorDisable: (request: TwoFactorProviderRequest) => Promise<TwoFactorProviderResponse>;
  putTwoFactorOrganizationDisable: (
    organizationId: string,
    request: TwoFactorProviderRequest
  ) => Promise<TwoFactorProviderResponse>;
  postTwoFactorRecover: (request: TwoFactorRecoveryRequest) => Promise<any>;
  postTwoFactorEmailSetup: (request: TwoFactorEmailRequest) => Promise<any>;
  postTwoFactorEmail: (request: TwoFactorEmailRequest) => Promise<any>;
  getDeviceVerificationSettings: () => Promise<DeviceVerificationResponse>;
  putDeviceVerificationSettings: (
    request: DeviceVerificationRequest
  ) => Promise<DeviceVerificationResponse>;
  getKnownDevice: (email: string, deviceIdentifier: string) => Promise<boolean>;

  getEmergencyAccessTrusted: () => Promise<ListResponse<EmergencyAccessGranteeDetailsResponse>>;
  getEmergencyAccessGranted: () => Promise<ListResponse<EmergencyAccessGrantorDetailsResponse>>;
  getEmergencyAccess: (id: string) => Promise<EmergencyAccessGranteeDetailsResponse>;
  getEmergencyGrantorPolicies: (id: string) => Promise<ListResponse<PolicyResponse>>;
  putEmergencyAccess: (id: string, request: EmergencyAccessUpdateRequest) => Promise<any>;
  deleteEmergencyAccess: (id: string) => Promise<any>;
  postEmergencyAccessInvite: (request: EmergencyAccessInviteRequest) => Promise<any>;
  postEmergencyAccessReinvite: (id: string) => Promise<any>;
  postEmergencyAccessAccept: (id: string, request: EmergencyAccessAcceptRequest) => Promise<any>;
  postEmergencyAccessConfirm: (id: string, request: EmergencyAccessConfirmRequest) => Promise<any>;
  postEmergencyAccessInitiate: (id: string) => Promise<any>;
  postEmergencyAccessApprove: (id: string) => Promise<any>;
  postEmergencyAccessReject: (id: string) => Promise<any>;
  postEmergencyAccessTakeover: (id: string) => Promise<EmergencyAccessTakeoverResponse>;
  postEmergencyAccessPassword: (
    id: string,
    request: EmergencyAccessPasswordRequest
  ) => Promise<any>;
  postEmergencyAccessView: (id: string) => Promise<EmergencyAccessViewResponse>;
  getCloudCommunicationsEnabled: () => Promise<boolean>;
  abstract getOrganizationConnection<TConfig extends OrganizationConnectionConfigApis>(
    id: string,
    type: OrganizationConnectionType,
    configType: { new (response: any): TConfig }
  ): Promise<OrganizationConnectionResponse<TConfig>>;
  abstract createOrganizationConnection<TConfig extends OrganizationConnectionConfigApis>(
    request: OrganizationConnectionRequest,
    configType: { new (response: any): TConfig }
  ): Promise<OrganizationConnectionResponse<TConfig>>;
  abstract updateOrganizationConnection<TConfig extends OrganizationConnectionConfigApis>(
    request: OrganizationConnectionRequest,
    configType: { new (response: any): TConfig },
    organizationConnectionId: string
  ): Promise<OrganizationConnectionResponse<TConfig>>;
  deleteOrganizationConnection: (id: string) => Promise<void>;
  getPlans: () => Promise<ListResponse<PlanResponse>>;
  getTaxRates: () => Promise<ListResponse<TaxRateResponse>>;

  postProviderSetup: (id: string, request: ProviderSetupRequest) => Promise<ProviderResponse>;
  getProvider: (id: string) => Promise<ProviderResponse>;
  putProvider: (id: string, request: ProviderUpdateRequest) => Promise<ProviderResponse>;

  getProviderUsers: (providerId: string) => Promise<ListResponse<ProviderUserUserDetailsResponse>>;
  getProviderUser: (providerId: string, id: string) => Promise<ProviderUserResponse>;
  postProviderUserInvite: (providerId: string, request: ProviderUserInviteRequest) => Promise<any>;
  postProviderUserReinvite: (providerId: string, id: string) => Promise<any>;
  postManyProviderUserReinvite: (
    providerId: string,
    request: ProviderUserBulkRequest
  ) => Promise<ListResponse<ProviderUserBulkResponse>>;
  postProviderUserAccept: (
    providerId: string,
    id: string,
    request: ProviderUserAcceptRequest
  ) => Promise<any>;
  postProviderUserConfirm: (
    providerId: string,
    id: string,
    request: ProviderUserConfirmRequest
  ) => Promise<any>;
  postProviderUsersPublicKey: (
    providerId: string,
    request: ProviderUserBulkRequest
  ) => Promise<ListResponse<ProviderUserBulkPublicKeyResponse>>;
  postProviderUserBulkConfirm: (
    providerId: string,
    request: ProviderUserBulkConfirmRequest
  ) => Promise<ListResponse<ProviderUserBulkResponse>>;
  putProviderUser: (
    providerId: string,
    id: string,
    request: ProviderUserUpdateRequest
  ) => Promise<any>;
  deleteProviderUser: (organizationId: string, id: string) => Promise<any>;
  deleteManyProviderUsers: (
    providerId: string,
    request: ProviderUserBulkRequest
  ) => Promise<ListResponse<ProviderUserBulkResponse>>;
  getProviderClients: (
    providerId: string
  ) => Promise<ListResponse<ProviderOrganizationOrganizationDetailsResponse>>;
  postProviderAddOrganization: (
    providerId: string,
    request: ProviderAddOrganizationRequest
  ) => Promise<any>;
  postProviderCreateOrganization: (
    providerId: string,
    request: ProviderOrganizationCreateRequest
  ) => Promise<ProviderOrganizationResponse>;
  deleteProviderOrganization: (providerId: string, organizationId: string) => Promise<any>;

  getEvents: (start: string, end: string, token: string) => Promise<ListResponse<EventResponse>>;
  getEventsCipher: (
    id: string,
    start: string,
    end: string,
    token: string
  ) => Promise<ListResponse<EventResponse>>;
  getEventsOrganization: (
    id: string,
    start: string,
    end: string,
    token: string
  ) => Promise<ListResponse<EventResponse>>;
  getEventsOrganizationUser: (
    organizationId: string,
    id: string,
    start: string,
    end: string,
    token: string
  ) => Promise<ListResponse<EventResponse>>;
  getEventsProvider: (
    id: string,
    start: string,
    end: string,
    token: string
  ) => Promise<ListResponse<EventResponse>>;
  getEventsProviderUser: (
    providerId: string,
    id: string,
    start: string,
    end: string,
    token: string
  ) => Promise<ListResponse<EventResponse>>;
  postEventsCollect: (request: EventRequest[]) => Promise<any>;

  deleteSsoUser: (organizationId: string) => Promise<void>;
  getSsoUserIdentifier: () => Promise<string>;

  getUserPublicKey: (id: string) => Promise<UserKeyResponse>;

  getHibpBreach: (username: string) => Promise<BreachAccountResponse[]>;

  postBitPayInvoice: (request: BitPayInvoiceRequest) => Promise<string>;
  postSetupPayment: () => Promise<string>;

  getActiveBearerToken: () => Promise<string>;
  fetch: (request: Request) => Promise<Response>;
  nativeFetch: (request: Request) => Promise<Response>;

  preValidateSso: (identifier: string) => Promise<SsoPreValidateResponse>;

  postCreateSponsorship: (
    sponsorshipOrgId: string,
    request: OrganizationSponsorshipCreateRequest
  ) => Promise<void>;
  getSponsorshipSyncStatus: (
    sponsoredOrgId: string
  ) => Promise<OrganizationSponsorshipSyncStatusResponse>;
  deleteRevokeSponsorship: (sponsoringOrganizationId: string) => Promise<void>;
  deleteRemoveSponsorship: (sponsoringOrgId: string) => Promise<void>;
  postPreValidateSponsorshipToken: (sponsorshipToken: string) => Promise<boolean>;
  postRedeemSponsorship: (
    sponsorshipToken: string,
    request: OrganizationSponsorshipRedeemRequest
  ) => Promise<void>;
  postResendSponsorshipOffer: (sponsoringOrgId: string) => Promise<void>;

  getUserKeyFromKeyConnector: (keyConnectorUrl: string) => Promise<KeyConnectorUserKeyResponse>;
  postUserKeyToKeyConnector: (
    keyConnectorUrl: string,
    request: KeyConnectorUserKeyRequest
  ) => Promise<void>;
  getKeyConnectorAlive: (keyConnectorUrl: string) => Promise<void>;
  getOrganizationExport: (organizationId: string) => Promise<OrganizationExportResponse>;
}
