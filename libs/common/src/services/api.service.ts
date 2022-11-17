import { ApiService as ApiServiceAbstraction } from "../abstractions/api.service";
import { AppIdService } from "../abstractions/appId.service";
import { EnvironmentService } from "../abstractions/environment.service";
import { PlatformUtilsService } from "../abstractions/platformUtils.service";
import { TokenService } from "../abstractions/token.service";
import { DeviceType } from "../enums/deviceType";
import { OrganizationConnectionType } from "../enums/organizationConnectionType";
import { Utils } from "../misc/utils";
import { SetKeyConnectorKeyRequest } from "../models/request/account/set-key-connector-key.request";
import { AttachmentRequest } from "../models/request/attachment.request";
import { BitPayInvoiceRequest } from "../models/request/bit-pay-invoice.request";
import { CipherBulkDeleteRequest } from "../models/request/cipher-bulk-delete.request";
import { CipherBulkMoveRequest } from "../models/request/cipher-bulk-move.request";
import { CipherBulkShareRequest } from "../models/request/cipher-bulk-share.request";
import { CipherCollectionsRequest } from "../models/request/cipher-collections.request";
import { CipherCreateRequest } from "../models/request/cipher-create.request";
import { CipherPartialRequest } from "../models/request/cipher-partial.request";
import { CipherShareRequest } from "../models/request/cipher-share.request";
import { CipherRequest } from "../models/request/cipher.request";
import { CollectionRequest } from "../models/request/collection.request";
import { DeleteRecoverRequest } from "../models/request/delete-recover.request";
import { DeviceVerificationRequest } from "../models/request/device-verification.request";
import { DeviceRequest } from "../models/request/device.request";
import { EmailTokenRequest } from "../models/request/email-token.request";
import { EmailRequest } from "../models/request/email.request";
import { EmergencyAccessAcceptRequest } from "../models/request/emergency-access-accept.request";
import { EmergencyAccessConfirmRequest } from "../models/request/emergency-access-confirm.request";
import { EmergencyAccessInviteRequest } from "../models/request/emergency-access-invite.request";
import { EmergencyAccessPasswordRequest } from "../models/request/emergency-access-password.request";
import { EmergencyAccessUpdateRequest } from "../models/request/emergency-access-update.request";
import { EventRequest } from "../models/request/event.request";
import { GroupRequest } from "../models/request/group.request";
import { IapCheckRequest } from "../models/request/iap-check.request";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { ImportCiphersRequest } from "../models/request/import-ciphers.request";
import { ImportOrganizationCiphersRequest } from "../models/request/import-organization-ciphers.request";
import { KdfRequest } from "../models/request/kdf.request";
import { KeyConnectorUserKeyRequest } from "../models/request/key-connector-user-key.request";
import { KeysRequest } from "../models/request/keys.request";
import { OrganizationConnectionRequest } from "../models/request/organization-connection.request";
import { OrganizationImportRequest } from "../models/request/organization-import.request";
import { OrganizationUserAcceptRequest } from "../models/request/organization-user-accept.request";
import { OrganizationUserBulkConfirmRequest } from "../models/request/organization-user-bulk-confirm.request";
import { OrganizationUserBulkRequest } from "../models/request/organization-user-bulk.request";
import { OrganizationUserConfirmRequest } from "../models/request/organization-user-confirm.request";
import { OrganizationUserInviteRequest } from "../models/request/organization-user-invite.request";
import { OrganizationUserResetPasswordEnrollmentRequest } from "../models/request/organization-user-reset-password-enrollment.request";
import { OrganizationUserResetPasswordRequest } from "../models/request/organization-user-reset-password.request";
import { OrganizationUserUpdateGroupsRequest } from "../models/request/organization-user-update-groups.request";
import { OrganizationUserUpdateRequest } from "../models/request/organization-user-update.request";
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
import { AttachmentUploadDataResponse } from "../models/response/attachment-upload-data.response";
import { AttachmentResponse } from "../models/response/attachment.response";
import { AuthRequestResponse } from "../models/response/auth-request.response";
import { RegisterResponse } from "../models/response/authentication/register.response";
import { BillingHistoryResponse } from "../models/response/billing-history.response";
import { BillingPaymentResponse } from "../models/response/billing-payment.response";
import { BreachAccountResponse } from "../models/response/breach-account.response";
import { CipherResponse } from "../models/response/cipher.response";
import {
  CollectionGroupDetailsResponse,
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
import { ErrorResponse } from "../models/response/error.response";
import { EventResponse } from "../models/response/event.response";
import { GroupDetailsResponse, GroupResponse } from "../models/response/group.response";
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
import { OrganizationUserBulkPublicKeyResponse } from "../models/response/organization-user-bulk-public-key.response";
import { OrganizationUserBulkResponse } from "../models/response/organization-user-bulk.response";
import {
  OrganizationUserDetailsResponse,
  OrganizationUserUserDetailsResponse,
  OrganizationUserResetPasswordDetailsReponse,
} from "../models/response/organization-user.response";
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
import { SyncResponse } from "../models/response/sync.response";
import { TaxInfoResponse } from "../models/response/tax-info.response";
import { TaxRateResponse } from "../models/response/tax-rate.response";
import { TwoFactorAuthenticatorResponse } from "../models/response/two-factor-authenticator.response";
import { TwoFactorDuoResponse } from "../models/response/two-factor-duo.response";
import { TwoFactorEmailResponse } from "../models/response/two-factor-email.response";
import { TwoFactorProviderResponse } from "../models/response/two-factor-provider.response";
import { TwoFactorRecoverResponse } from "../models/response/two-factor-recover.response";
import {
  TwoFactorWebAuthnResponse,
  ChallengeResponse,
} from "../models/response/two-factor-web-authn.response";
import { TwoFactorYubiKeyResponse } from "../models/response/two-factor-yubi-key.response";
import { UserKeyResponse } from "../models/response/user-key.response";
import { SendAccessView } from "../models/view/send-access.view";

export class ApiService implements ApiServiceAbstraction {
  private device: DeviceType;
  private deviceType: string;
  private isWebClient = false;
  private isDesktopClient = false;

  constructor(
    private tokenService: TokenService,
    private platformUtilsService: PlatformUtilsService,
    private environmentService: EnvironmentService,
    private appIdService: AppIdService,
    private logoutCallback: (expired: boolean) => Promise<void>,
    private customUserAgent: string = null
  ) {
    this.device = platformUtilsService.getDevice();
    this.deviceType = this.device.toString();
    this.isWebClient =
      this.device === DeviceType.IEBrowser ||
      this.device === DeviceType.ChromeBrowser ||
      this.device === DeviceType.EdgeBrowser ||
      this.device === DeviceType.FirefoxBrowser ||
      this.device === DeviceType.OperaBrowser ||
      this.device === DeviceType.SafariBrowser ||
      this.device === DeviceType.UnknownBrowser ||
      this.device === DeviceType.VivaldiBrowser;
    this.isDesktopClient =
      this.device === DeviceType.WindowsDesktop ||
      this.device === DeviceType.MacOsDesktop ||
      this.device === DeviceType.LinuxDesktop;
  }

  // Auth APIs

  async postIdentityToken(
    request: UserApiTokenRequest | PasswordTokenRequest | SsoTokenRequest
  ): Promise<IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse> {
    const headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      Accept: "application/json",
      "Device-Type": this.deviceType,
    });
    if (this.customUserAgent != null) {
      headers.set("User-Agent", this.customUserAgent);
    }
    request.alterIdentityTokenHeaders(headers);

    const identityToken =
      request instanceof UserApiTokenRequest
        ? request.toIdentityToken()
        : request.toIdentityToken(this.platformUtilsService.getClientType());

    const response = await this.fetch(
      new Request(this.environmentService.getIdentityUrl() + "/connect/token", {
        body: this.qsStringify(identityToken),
        credentials: this.getCredentials(),
        cache: "no-store",
        headers: headers,
        method: "POST",
      })
    );

    let responseJson: any = null;
    if (this.isJsonResponse(response)) {
      responseJson = await response.json();
    }

    if (responseJson != null) {
      if (response.status === 200) {
        return new IdentityTokenResponse(responseJson);
      } else if (
        response.status === 400 &&
        responseJson.TwoFactorProviders2 &&
        Object.keys(responseJson.TwoFactorProviders2).length
      ) {
        await this.tokenService.clearTwoFactorToken();
        return new IdentityTwoFactorResponse(responseJson);
      } else if (
        response.status === 400 &&
        responseJson.HCaptcha_SiteKey &&
        Object.keys(responseJson.HCaptcha_SiteKey).length
      ) {
        return new IdentityCaptchaResponse(responseJson);
      }
    }

    return Promise.reject(new ErrorResponse(responseJson, response.status, true));
  }

  async refreshIdentityToken(): Promise<any> {
    try {
      await this.doAuthRefresh();
    } catch (e) {
      return Promise.reject(null);
    }
  }

  async postAuthRequest(request: PasswordlessCreateAuthRequest): Promise<AuthRequestResponse> {
    const r = await this.send("POST", "/auth-requests/", request, false, true);
    return new AuthRequestResponse(r);
  }

  async getAuthResponse(id: string, accessCode: string): Promise<AuthRequestResponse> {
    const path = `/auth-requests/${id}/response?code=${accessCode}`;
    const r = await this.send("GET", path, null, false, true);
    return new AuthRequestResponse(r);
  }

  // Account APIs

  async getProfile(): Promise<ProfileResponse> {
    const r = await this.send("GET", "/accounts/profile", null, true, true);
    return new ProfileResponse(r);
  }

  async getUserSubscription(): Promise<SubscriptionResponse> {
    const r = await this.send("GET", "/accounts/subscription", null, true, true);
    return new SubscriptionResponse(r);
  }

  async getTaxInfo(): Promise<TaxInfoResponse> {
    const r = await this.send("GET", "/accounts/tax", null, true, true);
    return new TaxInfoResponse(r);
  }

  async putProfile(request: UpdateProfileRequest): Promise<ProfileResponse> {
    const r = await this.send("PUT", "/accounts/profile", request, true, true);
    return new ProfileResponse(r);
  }

  putTaxInfo(request: TaxInfoUpdateRequest): Promise<any> {
    return this.send("PUT", "/accounts/tax", request, true, false);
  }

  async postPrelogin(request: PreloginRequest): Promise<PreloginResponse> {
    const r = await this.send(
      "POST",
      "/accounts/prelogin",
      request,
      false,
      true,
      this.environmentService.getIdentityUrl()
    );
    return new PreloginResponse(r);
  }

  postEmailToken(request: EmailTokenRequest): Promise<any> {
    return this.send("POST", "/accounts/email-token", request, true, false);
  }

  postEmail(request: EmailRequest): Promise<any> {
    return this.send("POST", "/accounts/email", request, true, false);
  }

  postPassword(request: PasswordRequest): Promise<any> {
    return this.send("POST", "/accounts/password", request, true, false);
  }

  setPassword(request: SetPasswordRequest): Promise<any> {
    return this.send("POST", "/accounts/set-password", request, true, false);
  }

  postSetKeyConnectorKey(request: SetKeyConnectorKeyRequest): Promise<any> {
    return this.send("POST", "/accounts/set-key-connector-key", request, true, false);
  }

  postSecurityStamp(request: SecretVerificationRequest): Promise<any> {
    return this.send("POST", "/accounts/security-stamp", request, true, false);
  }

  async getAccountRevisionDate(): Promise<number> {
    const r = await this.send("GET", "/accounts/revision-date", null, true, true);
    return r as number;
  }

  postPasswordHint(request: PasswordHintRequest): Promise<any> {
    return this.send("POST", "/accounts/password-hint", request, false, false);
  }

  async postRegister(request: RegisterRequest): Promise<RegisterResponse> {
    const r = await this.send(
      "POST",
      "/accounts/register",
      request,
      false,
      true,
      this.environmentService.getIdentityUrl()
    );
    return new RegisterResponse(r);
  }

  async postPremium(data: FormData): Promise<PaymentResponse> {
    const r = await this.send("POST", "/accounts/premium", data, true, true);
    return new PaymentResponse(r);
  }

  async postIapCheck(request: IapCheckRequest): Promise<any> {
    return this.send("POST", "/accounts/iap-check", request, true, false);
  }

  postReinstatePremium(): Promise<any> {
    return this.send("POST", "/accounts/reinstate-premium", null, true, false);
  }

  postCancelPremium(): Promise<any> {
    return this.send("POST", "/accounts/cancel-premium", null, true, false);
  }

  async postAccountStorage(request: StorageRequest): Promise<PaymentResponse> {
    const r = await this.send("POST", "/accounts/storage", request, true, true);
    return new PaymentResponse(r);
  }

  postAccountPayment(request: PaymentRequest): Promise<void> {
    return this.send("POST", "/accounts/payment", request, true, false);
  }

  postAccountLicense(data: FormData): Promise<any> {
    return this.send("POST", "/accounts/license", data, true, false);
  }

  postAccountKeys(request: KeysRequest): Promise<any> {
    return this.send("POST", "/accounts/keys", request, true, false);
  }

  postAccountKey(request: UpdateKeyRequest): Promise<any> {
    return this.send("POST", "/accounts/key", request, true, false);
  }

  postAccountVerifyEmail(): Promise<any> {
    return this.send("POST", "/accounts/verify-email", null, true, false);
  }

  postAccountVerifyEmailToken(request: VerifyEmailRequest): Promise<any> {
    return this.send("POST", "/accounts/verify-email-token", request, false, false);
  }

  postAccountVerifyPassword(request: SecretVerificationRequest): Promise<any> {
    return this.send("POST", "/accounts/verify-password", request, true, false);
  }

  postAccountRecoverDelete(request: DeleteRecoverRequest): Promise<any> {
    return this.send("POST", "/accounts/delete-recover", request, false, false);
  }

  postAccountRecoverDeleteToken(request: VerifyDeleteRecoverRequest): Promise<any> {
    return this.send("POST", "/accounts/delete-recover-token", request, false, false);
  }

  postAccountKdf(request: KdfRequest): Promise<any> {
    return this.send("POST", "/accounts/kdf", request, true, false);
  }

  async deleteSsoUser(organizationId: string): Promise<void> {
    return this.send("DELETE", "/accounts/sso/" + organizationId, null, true, false);
  }

  async getSsoUserIdentifier(): Promise<string> {
    return this.send("GET", "/accounts/sso/user-identifier", null, true, true);
  }

  async postUserApiKey(id: string, request: SecretVerificationRequest): Promise<ApiKeyResponse> {
    const r = await this.send("POST", "/accounts/api-key", request, true, true);
    return new ApiKeyResponse(r);
  }

  async postUserRotateApiKey(
    id: string,
    request: SecretVerificationRequest
  ): Promise<ApiKeyResponse> {
    const r = await this.send("POST", "/accounts/rotate-api-key", request, true, true);
    return new ApiKeyResponse(r);
  }

  putUpdateTempPassword(request: UpdateTempPasswordRequest): Promise<any> {
    return this.send("PUT", "/accounts/update-temp-password", request, true, false);
  }

  postConvertToKeyConnector(): Promise<void> {
    return this.send("POST", "/accounts/convert-to-key-connector", null, true, false);
  }

  // Account Billing APIs

  async getUserBillingHistory(): Promise<BillingHistoryResponse> {
    const r = await this.send("GET", "/accounts/billing/history", null, true, true);
    return new BillingHistoryResponse(r);
  }

  async getUserBillingPayment(): Promise<BillingPaymentResponse> {
    const r = await this.send("GET", "/accounts/billing/payment-method", null, true, true);
    return new BillingPaymentResponse(r);
  }

  // Send APIs

  async getSend(id: string): Promise<SendResponse> {
    const r = await this.send("GET", "/sends/" + id, null, true, true);
    return new SendResponse(r);
  }

  async postSendAccess(
    id: string,
    request: SendAccessRequest,
    apiUrl?: string
  ): Promise<SendAccessResponse> {
    const addSendIdHeader = (headers: Headers) => {
      headers.set("Send-Id", id);
    };
    const r = await this.send(
      "POST",
      "/sends/access/" + id,
      request,
      false,
      true,
      apiUrl,
      addSendIdHeader
    );
    return new SendAccessResponse(r);
  }

  async getSendFileDownloadData(
    send: SendAccessView,
    request: SendAccessRequest,
    apiUrl?: string
  ): Promise<SendFileDownloadDataResponse> {
    const addSendIdHeader = (headers: Headers) => {
      headers.set("Send-Id", send.id);
    };
    const r = await this.send(
      "POST",
      "/sends/" + send.id + "/access/file/" + send.file.id,
      request,
      false,
      true,
      apiUrl,
      addSendIdHeader
    );
    return new SendFileDownloadDataResponse(r);
  }

  async getSends(): Promise<ListResponse<SendResponse>> {
    const r = await this.send("GET", "/sends", null, true, true);
    return new ListResponse(r, SendResponse);
  }

  async postSend(request: SendRequest): Promise<SendResponse> {
    const r = await this.send("POST", "/sends", request, true, true);
    return new SendResponse(r);
  }

  async postFileTypeSend(request: SendRequest): Promise<SendFileUploadDataResponse> {
    const r = await this.send("POST", "/sends/file/v2", request, true, true);
    return new SendFileUploadDataResponse(r);
  }

  async renewSendFileUploadUrl(
    sendId: string,
    fileId: string
  ): Promise<SendFileUploadDataResponse> {
    const r = await this.send("GET", "/sends/" + sendId + "/file/" + fileId, null, true, true);
    return new SendFileUploadDataResponse(r);
  }

  postSendFile(sendId: string, fileId: string, data: FormData): Promise<any> {
    return this.send("POST", "/sends/" + sendId + "/file/" + fileId, data, true, false);
  }

  /**
   * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
   * This method still exists for backward compatibility with old server versions.
   */
  async postSendFileLegacy(data: FormData): Promise<SendResponse> {
    const r = await this.send("POST", "/sends/file", data, true, true);
    return new SendResponse(r);
  }

  async putSend(id: string, request: SendRequest): Promise<SendResponse> {
    const r = await this.send("PUT", "/sends/" + id, request, true, true);
    return new SendResponse(r);
  }

  async putSendRemovePassword(id: string): Promise<SendResponse> {
    const r = await this.send("PUT", "/sends/" + id + "/remove-password", null, true, true);
    return new SendResponse(r);
  }

  deleteSend(id: string): Promise<any> {
    return this.send("DELETE", "/sends/" + id, null, true, false);
  }

  // Cipher APIs

  async getCipher(id: string): Promise<CipherResponse> {
    const r = await this.send("GET", "/ciphers/" + id, null, true, true);
    return new CipherResponse(r);
  }

  async getFullCipherDetails(id: string): Promise<CipherResponse> {
    const r = await this.send("GET", "/ciphers/" + id + "/details", null, true, true);
    return new CipherResponse(r);
  }

  async getCipherAdmin(id: string): Promise<CipherResponse> {
    const r = await this.send("GET", "/ciphers/" + id + "/admin", null, true, true);
    return new CipherResponse(r);
  }

  async getCiphersOrganization(organizationId: string): Promise<ListResponse<CipherResponse>> {
    const r = await this.send(
      "GET",
      "/ciphers/organization-details?organizationId=" + organizationId,
      null,
      true,
      true
    );
    return new ListResponse(r, CipherResponse);
  }

  async postCipher(request: CipherRequest): Promise<CipherResponse> {
    const r = await this.send("POST", "/ciphers", request, true, true);
    return new CipherResponse(r);
  }

  async postCipherCreate(request: CipherCreateRequest): Promise<CipherResponse> {
    const r = await this.send("POST", "/ciphers/create", request, true, true);
    return new CipherResponse(r);
  }

  async postCipherAdmin(request: CipherCreateRequest): Promise<CipherResponse> {
    const r = await this.send("POST", "/ciphers/admin", request, true, true);
    return new CipherResponse(r);
  }

  async putCipher(id: string, request: CipherRequest): Promise<CipherResponse> {
    const r = await this.send("PUT", "/ciphers/" + id, request, true, true);
    return new CipherResponse(r);
  }

  async putPartialCipher(id: string, request: CipherPartialRequest): Promise<CipherResponse> {
    const r = await this.send("PUT", "/ciphers/" + id + "/partial", request, true, true);
    return new CipherResponse(r);
  }

  async putCipherAdmin(id: string, request: CipherRequest): Promise<CipherResponse> {
    const r = await this.send("PUT", "/ciphers/" + id + "/admin", request, true, true);
    return new CipherResponse(r);
  }

  deleteCipher(id: string): Promise<any> {
    return this.send("DELETE", "/ciphers/" + id, null, true, false);
  }

  deleteCipherAdmin(id: string): Promise<any> {
    return this.send("DELETE", "/ciphers/" + id + "/admin", null, true, false);
  }

  deleteManyCiphers(request: CipherBulkDeleteRequest): Promise<any> {
    return this.send("DELETE", "/ciphers", request, true, false);
  }

  deleteManyCiphersAdmin(request: CipherBulkDeleteRequest): Promise<any> {
    return this.send("DELETE", "/ciphers/admin", request, true, false);
  }

  putMoveCiphers(request: CipherBulkMoveRequest): Promise<any> {
    return this.send("PUT", "/ciphers/move", request, true, false);
  }

  async putShareCipher(id: string, request: CipherShareRequest): Promise<CipherResponse> {
    const r = await this.send("PUT", "/ciphers/" + id + "/share", request, true, true);
    return new CipherResponse(r);
  }

  putShareCiphers(request: CipherBulkShareRequest): Promise<any> {
    return this.send("PUT", "/ciphers/share", request, true, false);
  }

  putCipherCollections(id: string, request: CipherCollectionsRequest): Promise<any> {
    return this.send("PUT", "/ciphers/" + id + "/collections", request, true, false);
  }

  putCipherCollectionsAdmin(id: string, request: CipherCollectionsRequest): Promise<any> {
    return this.send("PUT", "/ciphers/" + id + "/collections-admin", request, true, false);
  }

  postPurgeCiphers(
    request: SecretVerificationRequest,
    organizationId: string = null
  ): Promise<any> {
    let path = "/ciphers/purge";
    if (organizationId != null) {
      path += "?organizationId=" + organizationId;
    }
    return this.send("POST", path, request, true, false);
  }

  postImportCiphers(request: ImportCiphersRequest): Promise<any> {
    return this.send("POST", "/ciphers/import", request, true, false);
  }

  postImportOrganizationCiphers(
    organizationId: string,
    request: ImportOrganizationCiphersRequest
  ): Promise<any> {
    return this.send(
      "POST",
      "/ciphers/import-organization?organizationId=" + organizationId,
      request,
      true,
      false
    );
  }

  putDeleteCipher(id: string): Promise<any> {
    return this.send("PUT", "/ciphers/" + id + "/delete", null, true, false);
  }

  putDeleteCipherAdmin(id: string): Promise<any> {
    return this.send("PUT", "/ciphers/" + id + "/delete-admin", null, true, false);
  }

  putDeleteManyCiphers(request: CipherBulkDeleteRequest): Promise<any> {
    return this.send("PUT", "/ciphers/delete", request, true, false);
  }

  putDeleteManyCiphersAdmin(request: CipherBulkDeleteRequest): Promise<any> {
    return this.send("PUT", "/ciphers/delete-admin", request, true, false);
  }

  async putRestoreCipher(id: string): Promise<CipherResponse> {
    const r = await this.send("PUT", "/ciphers/" + id + "/restore", null, true, true);
    return new CipherResponse(r);
  }

  async putRestoreCipherAdmin(id: string): Promise<CipherResponse> {
    const r = await this.send("PUT", "/ciphers/" + id + "/restore-admin", null, true, true);
    return new CipherResponse(r);
  }

  async putRestoreManyCiphers(
    request: CipherBulkDeleteRequest
  ): Promise<ListResponse<CipherResponse>> {
    const r = await this.send("PUT", "/ciphers/restore", request, true, true);
    return new ListResponse<CipherResponse>(r, CipherResponse);
  }

  // Attachments APIs

  async getAttachmentData(
    cipherId: string,
    attachmentId: string,
    emergencyAccessId?: string
  ): Promise<AttachmentResponse> {
    const path =
      (emergencyAccessId != null ? "/emergency-access/" + emergencyAccessId + "/" : "/ciphers/") +
      cipherId +
      "/attachment/" +
      attachmentId;
    const r = await this.send("GET", path, null, true, true);
    return new AttachmentResponse(r);
  }

  async postCipherAttachment(
    id: string,
    request: AttachmentRequest
  ): Promise<AttachmentUploadDataResponse> {
    const r = await this.send("POST", "/ciphers/" + id + "/attachment/v2", request, true, true);
    return new AttachmentUploadDataResponse(r);
  }

  /**
   * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
   * This method still exists for backward compatibility with old server versions.
   */
  async postCipherAttachmentLegacy(id: string, data: FormData): Promise<CipherResponse> {
    const r = await this.send("POST", "/ciphers/" + id + "/attachment", data, true, true);
    return new CipherResponse(r);
  }

  /**
   * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
   * This method still exists for backward compatibility with old server versions.
   */
  async postCipherAttachmentAdminLegacy(id: string, data: FormData): Promise<CipherResponse> {
    const r = await this.send("POST", "/ciphers/" + id + "/attachment-admin", data, true, true);
    return new CipherResponse(r);
  }

  deleteCipherAttachment(id: string, attachmentId: string): Promise<any> {
    return this.send("DELETE", "/ciphers/" + id + "/attachment/" + attachmentId, null, true, false);
  }

  deleteCipherAttachmentAdmin(id: string, attachmentId: string): Promise<any> {
    return this.send(
      "DELETE",
      "/ciphers/" + id + "/attachment/" + attachmentId + "/admin",
      null,
      true,
      false
    );
  }

  postShareCipherAttachment(
    id: string,
    attachmentId: string,
    data: FormData,
    organizationId: string
  ): Promise<any> {
    return this.send(
      "POST",
      "/ciphers/" + id + "/attachment/" + attachmentId + "/share?organizationId=" + organizationId,
      data,
      true,
      false
    );
  }

  async renewAttachmentUploadUrl(
    id: string,
    attachmentId: string
  ): Promise<AttachmentUploadDataResponse> {
    const r = await this.send(
      "GET",
      "/ciphers/" + id + "/attachment/" + attachmentId + "/renew",
      null,
      true,
      true
    );
    return new AttachmentUploadDataResponse(r);
  }

  postAttachmentFile(id: string, attachmentId: string, data: FormData): Promise<any> {
    return this.send("POST", "/ciphers/" + id + "/attachment/" + attachmentId, data, true, false);
  }

  // Collections APIs

  async getCollectionDetails(
    organizationId: string,
    id: string
  ): Promise<CollectionGroupDetailsResponse> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/collections/" + id + "/details",
      null,
      true,
      true
    );
    return new CollectionGroupDetailsResponse(r);
  }

  async getUserCollections(): Promise<ListResponse<CollectionResponse>> {
    const r = await this.send("GET", "/collections", null, true, true);
    return new ListResponse(r, CollectionResponse);
  }

  async getCollections(organizationId: string): Promise<ListResponse<CollectionResponse>> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/collections",
      null,
      true,
      true
    );
    return new ListResponse(r, CollectionResponse);
  }

  async getCollectionUsers(
    organizationId: string,
    id: string
  ): Promise<SelectionReadOnlyResponse[]> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/collections/" + id + "/users",
      null,
      true,
      true
    );
    return r.map((dr: any) => new SelectionReadOnlyResponse(dr));
  }

  async postCollection(
    organizationId: string,
    request: CollectionRequest
  ): Promise<CollectionResponse> {
    const r = await this.send(
      "POST",
      "/organizations/" + organizationId + "/collections",
      request,
      true,
      true
    );
    return new CollectionResponse(r);
  }

  async putCollection(
    organizationId: string,
    id: string,
    request: CollectionRequest
  ): Promise<CollectionResponse> {
    const r = await this.send(
      "PUT",
      "/organizations/" + organizationId + "/collections/" + id,
      request,
      true,
      true
    );
    return new CollectionResponse(r);
  }

  async putCollectionUsers(
    organizationId: string,
    id: string,
    request: SelectionReadOnlyRequest[]
  ): Promise<any> {
    await this.send(
      "PUT",
      "/organizations/" + organizationId + "/collections/" + id + "/users",
      request,
      true,
      false
    );
  }

  deleteCollection(organizationId: string, id: string): Promise<any> {
    return this.send(
      "DELETE",
      "/organizations/" + organizationId + "/collections/" + id,
      null,
      true,
      false
    );
  }

  deleteCollectionUser(
    organizationId: string,
    id: string,
    organizationUserId: string
  ): Promise<any> {
    return this.send(
      "DELETE",
      "/organizations/" + organizationId + "/collections/" + id + "/user/" + organizationUserId,
      null,
      true,
      false
    );
  }

  // Groups APIs

  async getGroupDetails(organizationId: string, id: string): Promise<GroupDetailsResponse> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/groups/" + id + "/details",
      null,
      true,
      true
    );
    return new GroupDetailsResponse(r);
  }

  async getGroups(organizationId: string): Promise<ListResponse<GroupResponse>> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/groups",
      null,
      true,
      true
    );
    return new ListResponse(r, GroupResponse);
  }

  async getGroupUsers(organizationId: string, id: string): Promise<string[]> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/groups/" + id + "/users",
      null,
      true,
      true
    );
    return r;
  }

  async postGroup(organizationId: string, request: GroupRequest): Promise<GroupResponse> {
    const r = await this.send(
      "POST",
      "/organizations/" + organizationId + "/groups",
      request,
      true,
      true
    );
    return new GroupResponse(r);
  }

  async putGroup(
    organizationId: string,
    id: string,
    request: GroupRequest
  ): Promise<GroupResponse> {
    const r = await this.send(
      "PUT",
      "/organizations/" + organizationId + "/groups/" + id,
      request,
      true,
      true
    );
    return new GroupResponse(r);
  }

  async putGroupUsers(organizationId: string, id: string, request: string[]): Promise<any> {
    await this.send(
      "PUT",
      "/organizations/" + organizationId + "/groups/" + id + "/users",
      request,
      true,
      false
    );
  }

  deleteGroup(organizationId: string, id: string): Promise<any> {
    return this.send(
      "DELETE",
      "/organizations/" + organizationId + "/groups/" + id,
      null,
      true,
      false
    );
  }

  deleteGroupUser(organizationId: string, id: string, organizationUserId: string): Promise<any> {
    return this.send(
      "DELETE",
      "/organizations/" + organizationId + "/groups/" + id + "/user/" + organizationUserId,
      null,
      true,
      false
    );
  }

  // Organization User APIs

  async getOrganizationUser(
    organizationId: string,
    id: string
  ): Promise<OrganizationUserDetailsResponse> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/users/" + id,
      null,
      true,
      true
    );
    return new OrganizationUserDetailsResponse(r);
  }

  async getOrganizationUserGroups(organizationId: string, id: string): Promise<string[]> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/users/" + id + "/groups",
      null,
      true,
      true
    );
    return r;
  }

  async getOrganizationUsers(
    organizationId: string
  ): Promise<ListResponse<OrganizationUserUserDetailsResponse>> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/users",
      null,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserUserDetailsResponse);
  }

  async getOrganizationUserResetPasswordDetails(
    organizationId: string,
    id: string
  ): Promise<OrganizationUserResetPasswordDetailsReponse> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/users/" + id + "/reset-password-details",
      null,
      true,
      true
    );
    return new OrganizationUserResetPasswordDetailsReponse(r);
  }

  postOrganizationUserInvite(
    organizationId: string,
    request: OrganizationUserInviteRequest
  ): Promise<any> {
    return this.send(
      "POST",
      "/organizations/" + organizationId + "/users/invite",
      request,
      true,
      false
    );
  }

  postOrganizationUserReinvite(organizationId: string, id: string): Promise<any> {
    return this.send(
      "POST",
      "/organizations/" + organizationId + "/users/" + id + "/reinvite",
      null,
      true,
      false
    );
  }

  async postManyOrganizationUserReinvite(
    organizationId: string,
    request: OrganizationUserBulkRequest
  ): Promise<ListResponse<OrganizationUserBulkResponse>> {
    const r = await this.send(
      "POST",
      "/organizations/" + organizationId + "/users/reinvite",
      request,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserBulkResponse);
  }

  postOrganizationUserAccept(
    organizationId: string,
    id: string,
    request: OrganizationUserAcceptRequest
  ): Promise<any> {
    return this.send(
      "POST",
      "/organizations/" + organizationId + "/users/" + id + "/accept",
      request,
      true,
      false
    );
  }

  postOrganizationUserConfirm(
    organizationId: string,
    id: string,
    request: OrganizationUserConfirmRequest
  ): Promise<any> {
    return this.send(
      "POST",
      "/organizations/" + organizationId + "/users/" + id + "/confirm",
      request,
      true,
      false
    );
  }

  async postOrganizationUsersPublicKey(
    organizationId: string,
    request: OrganizationUserBulkRequest
  ): Promise<ListResponse<OrganizationUserBulkPublicKeyResponse>> {
    const r = await this.send(
      "POST",
      "/organizations/" + organizationId + "/users/public-keys",
      request,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserBulkPublicKeyResponse);
  }

  async postOrganizationUserBulkConfirm(
    organizationId: string,
    request: OrganizationUserBulkConfirmRequest
  ): Promise<ListResponse<OrganizationUserBulkResponse>> {
    const r = await this.send(
      "POST",
      "/organizations/" + organizationId + "/users/confirm",
      request,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserBulkResponse);
  }

  putOrganizationUser(
    organizationId: string,
    id: string,
    request: OrganizationUserUpdateRequest
  ): Promise<any> {
    return this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/" + id,
      request,
      true,
      false
    );
  }

  putOrganizationUserGroups(
    organizationId: string,
    id: string,
    request: OrganizationUserUpdateGroupsRequest
  ): Promise<any> {
    return this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/" + id + "/groups",
      request,
      true,
      false
    );
  }

  putOrganizationUserResetPasswordEnrollment(
    organizationId: string,
    userId: string,
    request: OrganizationUserResetPasswordEnrollmentRequest
  ): Promise<void> {
    return this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/" + userId + "/reset-password-enrollment",
      request,
      true,
      false
    );
  }

  putOrganizationUserResetPassword(
    organizationId: string,
    id: string,
    request: OrganizationUserResetPasswordRequest
  ): Promise<any> {
    return this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/" + id + "/reset-password",
      request,
      true,
      false
    );
  }

  deleteOrganizationUser(organizationId: string, id: string): Promise<any> {
    return this.send(
      "DELETE",
      "/organizations/" + organizationId + "/users/" + id,
      null,
      true,
      false
    );
  }

  async deleteManyOrganizationUsers(
    organizationId: string,
    request: OrganizationUserBulkRequest
  ): Promise<ListResponse<OrganizationUserBulkResponse>> {
    const r = await this.send(
      "DELETE",
      "/organizations/" + organizationId + "/users",
      request,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserBulkResponse);
  }

  revokeOrganizationUser(organizationId: string, id: string): Promise<any> {
    return this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/" + id + "/revoke",
      null,
      true,
      false
    );
  }

  async revokeManyOrganizationUsers(
    organizationId: string,
    request: OrganizationUserBulkRequest
  ): Promise<ListResponse<OrganizationUserBulkResponse>> {
    const r = await this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/revoke",
      request,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserBulkResponse);
  }

  restoreOrganizationUser(organizationId: string, id: string): Promise<any> {
    return this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/" + id + "/restore",
      null,
      true,
      false
    );
  }

  async restoreManyOrganizationUsers(
    organizationId: string,
    request: OrganizationUserBulkRequest
  ): Promise<ListResponse<OrganizationUserBulkResponse>> {
    const r = await this.send(
      "PUT",
      "/organizations/" + organizationId + "/users/restore",
      request,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserBulkResponse);
  }

  // Plan APIs

  async getPlans(): Promise<ListResponse<PlanResponse>> {
    const r = await this.send("GET", "/plans/", null, false, true);
    return new ListResponse(r, PlanResponse);
  }

  async postPublicImportDirectory(request: OrganizationImportRequest): Promise<any> {
    return this.send("POST", "/public/organization/import", request, true, false);
  }

  async getTaxRates(): Promise<ListResponse<TaxRateResponse>> {
    const r = await this.send("GET", "/plans/sales-tax-rates/", null, true, true);
    return new ListResponse(r, TaxRateResponse);
  }

  // Settings APIs

  async getSettingsDomains(): Promise<DomainsResponse> {
    const r = await this.send("GET", "/settings/domains", null, true, true);
    return new DomainsResponse(r);
  }

  async putSettingsDomains(request: UpdateDomainsRequest): Promise<DomainsResponse> {
    const r = await this.send("PUT", "/settings/domains", request, true, true);
    return new DomainsResponse(r);
  }

  // Sync APIs

  async getSync(): Promise<SyncResponse> {
    const path = this.isDesktopClient || this.isWebClient ? "/sync?excludeDomains=true" : "/sync";
    const r = await this.send("GET", path, null, true, true);
    return new SyncResponse(r);
  }

  // Two-factor APIs

  async getTwoFactorProviders(): Promise<ListResponse<TwoFactorProviderResponse>> {
    const r = await this.send("GET", "/two-factor", null, true, true);
    return new ListResponse(r, TwoFactorProviderResponse);
  }

  async getTwoFactorOrganizationProviders(
    organizationId: string
  ): Promise<ListResponse<TwoFactorProviderResponse>> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/two-factor",
      null,
      true,
      true
    );
    return new ListResponse(r, TwoFactorProviderResponse);
  }

  async getTwoFactorAuthenticator(
    request: SecretVerificationRequest
  ): Promise<TwoFactorAuthenticatorResponse> {
    const r = await this.send("POST", "/two-factor/get-authenticator", request, true, true);
    return new TwoFactorAuthenticatorResponse(r);
  }

  async getTwoFactorEmail(request: SecretVerificationRequest): Promise<TwoFactorEmailResponse> {
    const r = await this.send("POST", "/two-factor/get-email", request, true, true);
    return new TwoFactorEmailResponse(r);
  }

  async getTwoFactorDuo(request: SecretVerificationRequest): Promise<TwoFactorDuoResponse> {
    const r = await this.send("POST", "/two-factor/get-duo", request, true, true);
    return new TwoFactorDuoResponse(r);
  }

  async getTwoFactorOrganizationDuo(
    organizationId: string,
    request: SecretVerificationRequest
  ): Promise<TwoFactorDuoResponse> {
    const r = await this.send(
      "POST",
      "/organizations/" + organizationId + "/two-factor/get-duo",
      request,
      true,
      true
    );
    return new TwoFactorDuoResponse(r);
  }

  async getTwoFactorYubiKey(request: SecretVerificationRequest): Promise<TwoFactorYubiKeyResponse> {
    const r = await this.send("POST", "/two-factor/get-yubikey", request, true, true);
    return new TwoFactorYubiKeyResponse(r);
  }

  async getTwoFactorWebAuthn(
    request: SecretVerificationRequest
  ): Promise<TwoFactorWebAuthnResponse> {
    const r = await this.send("POST", "/two-factor/get-webauthn", request, true, true);
    return new TwoFactorWebAuthnResponse(r);
  }

  async getTwoFactorWebAuthnChallenge(
    request: SecretVerificationRequest
  ): Promise<ChallengeResponse> {
    const r = await this.send("POST", "/two-factor/get-webauthn-challenge", request, true, true);
    return new ChallengeResponse(r);
  }

  async getTwoFactorRecover(request: SecretVerificationRequest): Promise<TwoFactorRecoverResponse> {
    const r = await this.send("POST", "/two-factor/get-recover", request, true, true);
    return new TwoFactorRecoverResponse(r);
  }

  async putTwoFactorAuthenticator(
    request: UpdateTwoFactorAuthenticatorRequest
  ): Promise<TwoFactorAuthenticatorResponse> {
    const r = await this.send("PUT", "/two-factor/authenticator", request, true, true);
    return new TwoFactorAuthenticatorResponse(r);
  }

  async putTwoFactorEmail(request: UpdateTwoFactorEmailRequest): Promise<TwoFactorEmailResponse> {
    const r = await this.send("PUT", "/two-factor/email", request, true, true);
    return new TwoFactorEmailResponse(r);
  }

  async putTwoFactorDuo(request: UpdateTwoFactorDuoRequest): Promise<TwoFactorDuoResponse> {
    const r = await this.send("PUT", "/two-factor/duo", request, true, true);
    return new TwoFactorDuoResponse(r);
  }

  async putTwoFactorOrganizationDuo(
    organizationId: string,
    request: UpdateTwoFactorDuoRequest
  ): Promise<TwoFactorDuoResponse> {
    const r = await this.send(
      "PUT",
      "/organizations/" + organizationId + "/two-factor/duo",
      request,
      true,
      true
    );
    return new TwoFactorDuoResponse(r);
  }

  async putTwoFactorYubiKey(
    request: UpdateTwoFactorYubioOtpRequest
  ): Promise<TwoFactorYubiKeyResponse> {
    const r = await this.send("PUT", "/two-factor/yubikey", request, true, true);
    return new TwoFactorYubiKeyResponse(r);
  }

  async putTwoFactorWebAuthn(
    request: UpdateTwoFactorWebAuthnRequest
  ): Promise<TwoFactorWebAuthnResponse> {
    const response = request.deviceResponse.response as AuthenticatorAttestationResponse;
    const data: any = Object.assign({}, request);

    data.deviceResponse = {
      id: request.deviceResponse.id,
      rawId: btoa(request.deviceResponse.id),
      type: request.deviceResponse.type,
      extensions: request.deviceResponse.getClientExtensionResults(),
      response: {
        AttestationObject: Utils.fromBufferToB64(response.attestationObject),
        clientDataJson: Utils.fromBufferToB64(response.clientDataJSON),
      },
    };

    const r = await this.send("PUT", "/two-factor/webauthn", data, true, true);
    return new TwoFactorWebAuthnResponse(r);
  }

  async deleteTwoFactorWebAuthn(
    request: UpdateTwoFactorWebAuthnDeleteRequest
  ): Promise<TwoFactorWebAuthnResponse> {
    const r = await this.send("DELETE", "/two-factor/webauthn", request, true, true);
    return new TwoFactorWebAuthnResponse(r);
  }

  async putTwoFactorDisable(request: TwoFactorProviderRequest): Promise<TwoFactorProviderResponse> {
    const r = await this.send("PUT", "/two-factor/disable", request, true, true);
    return new TwoFactorProviderResponse(r);
  }

  async putTwoFactorOrganizationDisable(
    organizationId: string,
    request: TwoFactorProviderRequest
  ): Promise<TwoFactorProviderResponse> {
    const r = await this.send(
      "PUT",
      "/organizations/" + organizationId + "/two-factor/disable",
      request,
      true,
      true
    );
    return new TwoFactorProviderResponse(r);
  }

  postTwoFactorRecover(request: TwoFactorRecoveryRequest): Promise<any> {
    return this.send("POST", "/two-factor/recover", request, false, false);
  }

  postTwoFactorEmailSetup(request: TwoFactorEmailRequest): Promise<any> {
    return this.send("POST", "/two-factor/send-email", request, true, false);
  }

  postTwoFactorEmail(request: TwoFactorEmailRequest): Promise<any> {
    return this.send("POST", "/two-factor/send-email-login", request, false, false);
  }

  async getDeviceVerificationSettings(): Promise<DeviceVerificationResponse> {
    const r = await this.send(
      "GET",
      "/two-factor/get-device-verification-settings",
      null,
      true,
      true
    );
    return new DeviceVerificationResponse(r);
  }

  async putDeviceVerificationSettings(
    request: DeviceVerificationRequest
  ): Promise<DeviceVerificationResponse> {
    const r = await this.send(
      "PUT",
      "/two-factor/device-verification-settings",
      request,
      true,
      true
    );
    return new DeviceVerificationResponse(r);
  }

  async getKnownDevice(email: string, deviceIdentifier: string): Promise<boolean> {
    const path = `/devices/knowndevice/${email}/${deviceIdentifier}`;
    const r = await this.send("GET", path, null, false, true);
    return r as boolean;
  }

  // Emergency Access APIs

  async getEmergencyAccessTrusted(): Promise<ListResponse<EmergencyAccessGranteeDetailsResponse>> {
    const r = await this.send("GET", "/emergency-access/trusted", null, true, true);
    return new ListResponse(r, EmergencyAccessGranteeDetailsResponse);
  }

  async getEmergencyAccessGranted(): Promise<ListResponse<EmergencyAccessGrantorDetailsResponse>> {
    const r = await this.send("GET", "/emergency-access/granted", null, true, true);
    return new ListResponse(r, EmergencyAccessGrantorDetailsResponse);
  }

  async getEmergencyAccess(id: string): Promise<EmergencyAccessGranteeDetailsResponse> {
    const r = await this.send("GET", "/emergency-access/" + id, null, true, true);
    return new EmergencyAccessGranteeDetailsResponse(r);
  }

  async getEmergencyGrantorPolicies(id: string): Promise<ListResponse<PolicyResponse>> {
    const r = await this.send("GET", "/emergency-access/" + id + "/policies", null, true, true);
    return new ListResponse(r, PolicyResponse);
  }

  putEmergencyAccess(id: string, request: EmergencyAccessUpdateRequest): Promise<any> {
    return this.send("PUT", "/emergency-access/" + id, request, true, false);
  }

  deleteEmergencyAccess(id: string): Promise<any> {
    return this.send("DELETE", "/emergency-access/" + id, null, true, false);
  }

  postEmergencyAccessInvite(request: EmergencyAccessInviteRequest): Promise<any> {
    return this.send("POST", "/emergency-access/invite", request, true, false);
  }

  postEmergencyAccessReinvite(id: string): Promise<any> {
    return this.send("POST", "/emergency-access/" + id + "/reinvite", null, true, false);
  }

  postEmergencyAccessAccept(id: string, request: EmergencyAccessAcceptRequest): Promise<any> {
    return this.send("POST", "/emergency-access/" + id + "/accept", request, true, false);
  }

  postEmergencyAccessConfirm(id: string, request: EmergencyAccessConfirmRequest): Promise<any> {
    return this.send("POST", "/emergency-access/" + id + "/confirm", request, true, false);
  }

  postEmergencyAccessInitiate(id: string): Promise<any> {
    return this.send("POST", "/emergency-access/" + id + "/initiate", null, true, false);
  }

  postEmergencyAccessApprove(id: string): Promise<any> {
    return this.send("POST", "/emergency-access/" + id + "/approve", null, true, false);
  }

  postEmergencyAccessReject(id: string): Promise<any> {
    return this.send("POST", "/emergency-access/" + id + "/reject", null, true, false);
  }

  async postEmergencyAccessTakeover(id: string): Promise<EmergencyAccessTakeoverResponse> {
    const r = await this.send("POST", "/emergency-access/" + id + "/takeover", null, true, true);
    return new EmergencyAccessTakeoverResponse(r);
  }

  async postEmergencyAccessPassword(
    id: string,
    request: EmergencyAccessPasswordRequest
  ): Promise<any> {
    await this.send("POST", "/emergency-access/" + id + "/password", request, true, true);
  }

  async postEmergencyAccessView(id: string): Promise<EmergencyAccessViewResponse> {
    const r = await this.send("POST", "/emergency-access/" + id + "/view", null, true, true);
    return new EmergencyAccessViewResponse(r);
  }

  // Organization APIs

  async getCloudCommunicationsEnabled(): Promise<boolean> {
    const r = await this.send("GET", "/organizations/connections/enabled", null, true, true);
    return r as boolean;
  }

  async getOrganizationConnection<TConfig extends OrganizationConnectionConfigApis>(
    id: string,
    type: OrganizationConnectionType,
    configType: { new (response: any): TConfig }
  ): Promise<OrganizationConnectionResponse<TConfig>> {
    const r = await this.send("GET", `/organizations/connections/${id}/${type}`, null, true, true);
    return new OrganizationConnectionResponse(r, configType);
  }

  async createOrganizationConnection<TConfig extends OrganizationConnectionConfigApis>(
    request: OrganizationConnectionRequest,
    configType: { new (response: any): TConfig }
  ): Promise<OrganizationConnectionResponse<TConfig>> {
    const r = await this.send("POST", "/organizations/connections/", request, true, true);
    return new OrganizationConnectionResponse(r, configType);
  }

  async updateOrganizationConnection<TConfig extends OrganizationConnectionConfigApis>(
    request: OrganizationConnectionRequest,
    configType: { new (response: any): TConfig },
    organizationConnectionId?: string
  ): Promise<OrganizationConnectionResponse<TConfig>> {
    const r = await this.send(
      "PUT",
      "/organizations/connections/" + organizationConnectionId,
      request,
      true,
      true
    );
    return new OrganizationConnectionResponse(r, configType);
  }

  async deleteOrganizationConnection(id: string): Promise<void> {
    return this.send("DELETE", "/organizations/connections/" + id, null, true, false);
  }

  // Provider APIs

  async postProviderSetup(id: string, request: ProviderSetupRequest) {
    const r = await this.send("POST", "/providers/" + id + "/setup", request, true, true);
    return new ProviderResponse(r);
  }

  async getProvider(id: string) {
    const r = await this.send("GET", "/providers/" + id, null, true, true);
    return new ProviderResponse(r);
  }

  async putProvider(id: string, request: ProviderUpdateRequest) {
    const r = await this.send("PUT", "/providers/" + id, request, true, true);
    return new ProviderResponse(r);
  }

  // Provider User APIs

  async getProviderUsers(
    providerId: string
  ): Promise<ListResponse<ProviderUserUserDetailsResponse>> {
    const r = await this.send("GET", "/providers/" + providerId + "/users", null, true, true);
    return new ListResponse(r, ProviderUserUserDetailsResponse);
  }

  async getProviderUser(providerId: string, id: string): Promise<ProviderUserResponse> {
    const r = await this.send("GET", "/providers/" + providerId + "/users/" + id, null, true, true);
    return new ProviderUserResponse(r);
  }

  postProviderUserInvite(providerId: string, request: ProviderUserInviteRequest): Promise<any> {
    return this.send("POST", "/providers/" + providerId + "/users/invite", request, true, false);
  }

  postProviderUserReinvite(providerId: string, id: string): Promise<any> {
    return this.send(
      "POST",
      "/providers/" + providerId + "/users/" + id + "/reinvite",
      null,
      true,
      false
    );
  }

  async postManyProviderUserReinvite(
    providerId: string,
    request: ProviderUserBulkRequest
  ): Promise<ListResponse<ProviderUserBulkResponse>> {
    const r = await this.send(
      "POST",
      "/providers/" + providerId + "/users/reinvite",
      request,
      true,
      true
    );
    return new ListResponse(r, ProviderUserBulkResponse);
  }

  async postProviderUserBulkConfirm(
    providerId: string,
    request: ProviderUserBulkConfirmRequest
  ): Promise<ListResponse<ProviderUserBulkResponse>> {
    const r = await this.send(
      "POST",
      "/providers/" + providerId + "/users/confirm",
      request,
      true,
      true
    );
    return new ListResponse(r, ProviderUserBulkResponse);
  }

  async deleteManyProviderUsers(
    providerId: string,
    request: ProviderUserBulkRequest
  ): Promise<ListResponse<ProviderUserBulkResponse>> {
    const r = await this.send("DELETE", "/providers/" + providerId + "/users", request, true, true);
    return new ListResponse(r, ProviderUserBulkResponse);
  }

  postProviderUserAccept(
    providerId: string,
    id: string,
    request: ProviderUserAcceptRequest
  ): Promise<any> {
    return this.send(
      "POST",
      "/providers/" + providerId + "/users/" + id + "/accept",
      request,
      true,
      false
    );
  }

  postProviderUserConfirm(
    providerId: string,
    id: string,
    request: ProviderUserConfirmRequest
  ): Promise<any> {
    return this.send(
      "POST",
      "/providers/" + providerId + "/users/" + id + "/confirm",
      request,
      true,
      false
    );
  }

  async postProviderUsersPublicKey(
    providerId: string,
    request: ProviderUserBulkRequest
  ): Promise<ListResponse<ProviderUserBulkPublicKeyResponse>> {
    const r = await this.send(
      "POST",
      "/providers/" + providerId + "/users/public-keys",
      request,
      true,
      true
    );
    return new ListResponse(r, ProviderUserBulkPublicKeyResponse);
  }

  putProviderUser(
    providerId: string,
    id: string,
    request: ProviderUserUpdateRequest
  ): Promise<any> {
    return this.send("PUT", "/providers/" + providerId + "/users/" + id, request, true, false);
  }

  deleteProviderUser(providerId: string, id: string): Promise<any> {
    return this.send("DELETE", "/providers/" + providerId + "/users/" + id, null, true, false);
  }

  // Provider Organization APIs

  async getProviderClients(
    providerId: string
  ): Promise<ListResponse<ProviderOrganizationOrganizationDetailsResponse>> {
    const r = await this.send(
      "GET",
      "/providers/" + providerId + "/organizations",
      null,
      true,
      true
    );
    return new ListResponse(r, ProviderOrganizationOrganizationDetailsResponse);
  }

  postProviderAddOrganization(
    providerId: string,
    request: ProviderAddOrganizationRequest
  ): Promise<any> {
    return this.send(
      "POST",
      "/providers/" + providerId + "/organizations/add",
      request,
      true,
      false
    );
  }

  async postProviderCreateOrganization(
    providerId: string,
    request: ProviderOrganizationCreateRequest
  ): Promise<ProviderOrganizationResponse> {
    const r = await this.send(
      "POST",
      "/providers/" + providerId + "/organizations",
      request,
      true,
      true
    );
    return new ProviderOrganizationResponse(r);
  }

  deleteProviderOrganization(providerId: string, id: string): Promise<any> {
    return this.send(
      "DELETE",
      "/providers/" + providerId + "/organizations/" + id,
      null,
      true,
      false
    );
  }

  // Event APIs

  async getEvents(start: string, end: string, token: string): Promise<ListResponse<EventResponse>> {
    const r = await this.send(
      "GET",
      this.addEventParameters("/events", start, end, token),
      null,
      true,
      true
    );
    return new ListResponse(r, EventResponse);
  }

  async getEventsCipher(
    id: string,
    start: string,
    end: string,
    token: string
  ): Promise<ListResponse<EventResponse>> {
    const r = await this.send(
      "GET",
      this.addEventParameters("/ciphers/" + id + "/events", start, end, token),
      null,
      true,
      true
    );
    return new ListResponse(r, EventResponse);
  }

  async getEventsOrganization(
    id: string,
    start: string,
    end: string,
    token: string
  ): Promise<ListResponse<EventResponse>> {
    const r = await this.send(
      "GET",
      this.addEventParameters("/organizations/" + id + "/events", start, end, token),
      null,
      true,
      true
    );
    return new ListResponse(r, EventResponse);
  }

  async getEventsOrganizationUser(
    organizationId: string,
    id: string,
    start: string,
    end: string,
    token: string
  ): Promise<ListResponse<EventResponse>> {
    const r = await this.send(
      "GET",
      this.addEventParameters(
        "/organizations/" + organizationId + "/users/" + id + "/events",
        start,
        end,
        token
      ),
      null,
      true,
      true
    );
    return new ListResponse(r, EventResponse);
  }

  async getEventsProvider(
    id: string,
    start: string,
    end: string,
    token: string
  ): Promise<ListResponse<EventResponse>> {
    const r = await this.send(
      "GET",
      this.addEventParameters("/providers/" + id + "/events", start, end, token),
      null,
      true,
      true
    );
    return new ListResponse(r, EventResponse);
  }

  async getEventsProviderUser(
    providerId: string,
    id: string,
    start: string,
    end: string,
    token: string
  ): Promise<ListResponse<EventResponse>> {
    const r = await this.send(
      "GET",
      this.addEventParameters(
        "/providers/" + providerId + "/users/" + id + "/events",
        start,
        end,
        token
      ),
      null,
      true,
      true
    );
    return new ListResponse(r, EventResponse);
  }

  async postEventsCollect(request: EventRequest[]): Promise<any> {
    const authHeader = await this.getActiveBearerToken();
    const headers = new Headers({
      "Device-Type": this.deviceType,
      Authorization: "Bearer " + authHeader,
      "Content-Type": "application/json; charset=utf-8",
    });
    if (this.customUserAgent != null) {
      headers.set("User-Agent", this.customUserAgent);
    }
    const response = await this.fetch(
      new Request(this.environmentService.getEventsUrl() + "/collect", {
        cache: "no-store",
        credentials: this.getCredentials(),
        method: "POST",
        body: JSON.stringify(request),
        headers: headers,
      })
    );
    if (response.status !== 200) {
      return Promise.reject("Event post failed.");
    }
  }

  // User APIs

  async getUserPublicKey(id: string): Promise<UserKeyResponse> {
    const r = await this.send("GET", "/users/" + id + "/public-key", null, true, true);
    return new UserKeyResponse(r);
  }

  // HIBP APIs

  async getHibpBreach(username: string): Promise<BreachAccountResponse[]> {
    const r = await this.send("GET", "/hibp/breach?username=" + username, null, true, true);
    return r.map((a: any) => new BreachAccountResponse(a));
  }

  // Misc

  async postBitPayInvoice(request: BitPayInvoiceRequest): Promise<string> {
    const r = await this.send("POST", "/bitpay-invoice", request, true, true);
    return r as string;
  }

  async postSetupPayment(): Promise<string> {
    const r = await this.send("POST", "/setup-payment", null, true, true);
    return r as string;
  }

  // Key Connector

  async getUserKeyFromKeyConnector(keyConnectorUrl: string): Promise<KeyConnectorUserKeyResponse> {
    const authHeader = await this.getActiveBearerToken();

    const response = await this.fetch(
      new Request(keyConnectorUrl + "/user-keys", {
        cache: "no-store",
        method: "GET",
        headers: new Headers({
          Accept: "application/json",
          Authorization: "Bearer " + authHeader,
        }),
      })
    );

    if (response.status !== 200) {
      const error = await this.handleError(response, false, true);
      return Promise.reject(error);
    }

    return new KeyConnectorUserKeyResponse(await response.json());
  }

  async postUserKeyToKeyConnector(
    keyConnectorUrl: string,
    request: KeyConnectorUserKeyRequest
  ): Promise<void> {
    const authHeader = await this.getActiveBearerToken();

    const response = await this.fetch(
      new Request(keyConnectorUrl + "/user-keys", {
        cache: "no-store",
        method: "POST",
        headers: new Headers({
          Accept: "application/json",
          Authorization: "Bearer " + authHeader,
          "Content-Type": "application/json; charset=utf-8",
        }),
        body: JSON.stringify(request),
      })
    );

    if (response.status !== 200) {
      const error = await this.handleError(response, false, true);
      return Promise.reject(error);
    }
  }

  async getKeyConnectorAlive(keyConnectorUrl: string) {
    const response = await this.fetch(
      new Request(keyConnectorUrl + "/alive", {
        cache: "no-store",
        method: "GET",
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        }),
      })
    );

    if (response.status !== 200) {
      const error = await this.handleError(response, false, true);
      return Promise.reject(error);
    }
  }

  async getOrganizationExport(organizationId: string): Promise<OrganizationExportResponse> {
    const r = await this.send(
      "GET",
      "/organizations/" + organizationId + "/export",
      null,
      true,
      true
    );
    return new OrganizationExportResponse(r);
  }

  // Helpers

  async getActiveBearerToken(): Promise<string> {
    let accessToken = await this.tokenService.getToken();
    if (await this.tokenService.tokenNeedsRefresh()) {
      await this.doAuthRefresh();
      accessToken = await this.tokenService.getToken();
    }
    return accessToken;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") {
      request.headers.set("Cache-Control", "no-store");
      request.headers.set("Pragma", "no-cache");
    }
    request.headers.set("Bitwarden-Client-Name", this.platformUtilsService.getClientType());
    request.headers.set(
      "Bitwarden-Client-Version",
      await this.platformUtilsService.getApplicationVersion()
    );
    return this.nativeFetch(request);
  }

  nativeFetch(request: Request): Promise<Response> {
    return fetch(request);
  }

  async preValidateSso(identifier: string): Promise<SsoPreValidateResponse> {
    if (identifier == null || identifier === "") {
      throw new Error("Organization Identifier was not provided.");
    }
    const headers = new Headers({
      Accept: "application/json",
      "Device-Type": this.deviceType,
    });
    if (this.customUserAgent != null) {
      headers.set("User-Agent", this.customUserAgent);
    }

    const path = `/account/prevalidate?domainHint=${encodeURIComponent(identifier)}`;
    const response = await this.fetch(
      new Request(this.environmentService.getIdentityUrl() + path, {
        cache: "no-store",
        credentials: this.getCredentials(),
        headers: headers,
        method: "GET",
      })
    );

    if (response.status === 200) {
      const body = await response.json();
      return new SsoPreValidateResponse(body);
    } else {
      const error = await this.handleError(response, false, true);
      return Promise.reject(error);
    }
  }

  async postCreateSponsorship(
    sponsoredOrgId: string,
    request: OrganizationSponsorshipCreateRequest
  ): Promise<void> {
    return await this.send(
      "POST",
      "/organization/sponsorship/" +
        (this.platformUtilsService.isSelfHost() ? "self-hosted/" : "") +
        sponsoredOrgId +
        "/families-for-enterprise",
      request,
      true,
      false
    );
  }

  async getSponsorshipSyncStatus(
    sponsoredOrgId: string
  ): Promise<OrganizationSponsorshipSyncStatusResponse> {
    const response = await this.send(
      "GET",
      "/organization/sponsorship/" + sponsoredOrgId + "/sync-status",
      null,
      true,
      true
    );
    return new OrganizationSponsorshipSyncStatusResponse(response);
  }

  async deleteRevokeSponsorship(sponsoringOrganizationId: string): Promise<void> {
    return await this.send(
      "DELETE",
      "/organization/sponsorship/" +
        (this.platformUtilsService.isSelfHost() ? "self-hosted/" : "") +
        sponsoringOrganizationId,
      null,
      true,
      false
    );
  }

  async deleteRemoveSponsorship(sponsoringOrgId: string): Promise<void> {
    return await this.send(
      "DELETE",
      "/organization/sponsorship/sponsored/" + sponsoringOrgId,
      null,
      true,
      false
    );
  }

  async postPreValidateSponsorshipToken(sponsorshipToken: string): Promise<boolean> {
    const r = await this.send(
      "POST",
      "/organization/sponsorship/validate-token?sponsorshipToken=" +
        encodeURIComponent(sponsorshipToken),
      null,
      true,
      true
    );
    return r as boolean;
  }

  async postRedeemSponsorship(
    sponsorshipToken: string,
    request: OrganizationSponsorshipRedeemRequest
  ): Promise<void> {
    return await this.send(
      "POST",
      "/organization/sponsorship/redeem?sponsorshipToken=" + encodeURIComponent(sponsorshipToken),
      request,
      true,
      false
    );
  }

  async postResendSponsorshipOffer(sponsoringOrgId: string): Promise<void> {
    return await this.send(
      "POST",
      "/organization/sponsorship/" + sponsoringOrgId + "/families-for-enterprise/resend",
      null,
      true,
      false
    );
  }

  protected async doAuthRefresh(): Promise<void> {
    const refreshToken = await this.tokenService.getRefreshToken();
    if (refreshToken != null && refreshToken !== "") {
      return this.doRefreshToken();
    }

    const clientId = await this.tokenService.getClientId();
    const clientSecret = await this.tokenService.getClientSecret();
    if (!Utils.isNullOrWhitespace(clientId) && !Utils.isNullOrWhitespace(clientSecret)) {
      return this.doApiTokenRefresh();
    }

    throw new Error("Cannot refresh token, no refresh token or api keys are stored");
  }

  protected async doRefreshToken(): Promise<void> {
    const refreshToken = await this.tokenService.getRefreshToken();
    if (refreshToken == null || refreshToken === "") {
      throw new Error();
    }
    const headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      Accept: "application/json",
      "Device-Type": this.deviceType,
    });
    if (this.customUserAgent != null) {
      headers.set("User-Agent", this.customUserAgent);
    }

    const decodedToken = await this.tokenService.decodeToken();
    const response = await this.fetch(
      new Request(this.environmentService.getIdentityUrl() + "/connect/token", {
        body: this.qsStringify({
          grant_type: "refresh_token",
          client_id: decodedToken.client_id,
          refresh_token: refreshToken,
        }),
        cache: "no-store",
        credentials: this.getCredentials(),
        headers: headers,
        method: "POST",
      })
    );

    if (response.status === 200) {
      const responseJson = await response.json();
      const tokenResponse = new IdentityTokenResponse(responseJson);
      await this.tokenService.setTokens(
        tokenResponse.accessToken,
        tokenResponse.refreshToken,
        null
      );
    } else {
      const error = await this.handleError(response, true, true);
      return Promise.reject(error);
    }
  }

  protected async doApiTokenRefresh(): Promise<void> {
    const clientId = await this.tokenService.getClientId();
    const clientSecret = await this.tokenService.getClientSecret();

    const appId = await this.appIdService.getAppId();
    const deviceRequest = new DeviceRequest(appId, this.platformUtilsService);
    const tokenRequest = new UserApiTokenRequest(
      clientId,
      clientSecret,
      new TokenTwoFactorRequest(),
      deviceRequest
    );

    const response = await this.postIdentityToken(tokenRequest);
    if (!(response instanceof IdentityTokenResponse)) {
      throw new Error("Invalid response received when refreshing api token");
    }

    await this.tokenService.setToken(response.accessToken);
  }

  async send(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body: any,
    authed: boolean,
    hasResponse: boolean,
    apiUrl?: string,
    alterHeaders?: (headers: Headers) => void
  ): Promise<any> {
    apiUrl = Utils.isNullOrWhitespace(apiUrl) ? this.environmentService.getApiUrl() : apiUrl;

    const requestUrl = apiUrl + path;
    // Prevent directory traversal from malicious paths
    if (new URL(requestUrl).href !== requestUrl) {
      return Promise.reject("Invalid request url path.");
    }

    const headers = new Headers({
      "Device-Type": this.deviceType,
    });
    if (this.customUserAgent != null) {
      headers.set("User-Agent", this.customUserAgent);
    }

    const requestInit: RequestInit = {
      cache: "no-store",
      credentials: this.getCredentials(),
      method: method,
    };

    if (authed) {
      const authHeader = await this.getActiveBearerToken();
      headers.set("Authorization", "Bearer " + authHeader);
    }
    if (body != null) {
      if (typeof body === "string") {
        requestInit.body = body;
        headers.set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
      } else if (typeof body === "object") {
        if (body instanceof FormData) {
          requestInit.body = body;
        } else {
          headers.set("Content-Type", "application/json; charset=utf-8");
          requestInit.body = JSON.stringify(body);
        }
      }
    }
    if (hasResponse) {
      headers.set("Accept", "application/json");
    }
    if (alterHeaders != null) {
      alterHeaders(headers);
    }

    requestInit.headers = headers;
    const response = await this.fetch(new Request(requestUrl, requestInit));

    const responseType = response.headers.get("content-type");
    const responseIsJson = responseType != null && responseType.indexOf("application/json") !== -1;
    if (hasResponse && response.status === 200 && responseIsJson) {
      const responseJson = await response.json();
      return responseJson;
    } else if (response.status !== 200) {
      const error = await this.handleError(response, false, authed);
      return Promise.reject(error);
    }
  }

  private async handleError(
    response: Response,
    tokenError: boolean,
    authed: boolean
  ): Promise<ErrorResponse> {
    let responseJson: any = null;
    if (this.isJsonResponse(response)) {
      responseJson = await response.json();
    } else if (this.isTextResponse(response)) {
      responseJson = { Message: await response.text() };
    }

    if (authed) {
      if (
        response.status === 401 ||
        response.status === 403 ||
        (tokenError &&
          response.status === 400 &&
          responseJson != null &&
          responseJson.error === "invalid_grant")
      ) {
        await this.logoutCallback(true);
        return null;
      }
    }

    return new ErrorResponse(responseJson, response.status, tokenError);
  }

  private qsStringify(params: any): string {
    return Object.keys(params)
      .map((key) => {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      })
      .join("&");
  }

  private getCredentials(): RequestCredentials {
    if (!this.isWebClient || this.environmentService.hasBaseUrl()) {
      return "include";
    }
    return undefined;
  }

  private addEventParameters(base: string, start: string, end: string, token: string) {
    if (start != null) {
      base += "?start=" + start;
    }
    if (end != null) {
      base += base.indexOf("?") > -1 ? "&" : "?";
      base += "end=" + end;
    }
    if (token != null) {
      base += base.indexOf("?") > -1 ? "&" : "?";
      base += "continuationToken=" + token;
    }
    return base;
  }

  private isJsonResponse(response: Response): boolean {
    const typeHeader = response.headers.get("content-type");
    return typeHeader != null && typeHeader.indexOf("application/json") > -1;
  }

  private isTextResponse(response: Response): boolean {
    const typeHeader = response.headers.get("content-type");
    return typeHeader != null && typeHeader.indexOf("text") > -1;
  }
}
