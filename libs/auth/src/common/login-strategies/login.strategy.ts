import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { ForceSetPasswordReason } from "@bitwarden/common/auth/models/domain/force-set-password-reason";
import { DeviceRequest } from "@bitwarden/common/auth/models/request/identity-token/device.request";
import { PasswordTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/sso-token.request";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { UserApiTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/user-api-token.request";
import { WebAuthnLoginTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/webauthn-login-token.request";
import { IdentityCaptchaResponse } from "@bitwarden/common/auth/models/response/identity-captcha.response";
import { IdentityTokenResponse } from "@bitwarden/common/auth/models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "@bitwarden/common/auth/models/response/identity-two-factor.response";
import { ClientType } from "@bitwarden/common/enums";
import { KeysRequest } from "@bitwarden/common/models/request/keys.request";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import {
  AccountKeys,
  Account,
  AccountProfile,
  AccountTokens,
  AccountDecryptionOptions,
} from "@bitwarden/common/platform/models/domain/account";

import {
  UserApiLoginCredentials,
  PasswordLoginCredentials,
  SsoLoginCredentials,
  AuthRequestLoginCredentials,
  WebAuthnLoginCredentials,
} from "../models/domain/login-credentials";

type IdentityResponse = IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse;

export abstract class LoginStrategy {
  protected abstract tokenRequest:
    | UserApiTokenRequest
    | PasswordTokenRequest
    | SsoTokenRequest
    | WebAuthnLoginTokenRequest;
  protected captchaBypassToken: string = null;

  constructor(
    protected cryptoService: CryptoService,
    protected apiService: ApiService,
    protected tokenService: TokenService,
    protected appIdService: AppIdService,
    protected platformUtilsService: PlatformUtilsService,
    protected messagingService: MessagingService,
    protected logService: LogService,
    protected stateService: StateService,
    protected twoFactorService: TwoFactorService,
  ) {}

  abstract logIn(
    credentials:
      | UserApiLoginCredentials
      | PasswordLoginCredentials
      | SsoLoginCredentials
      | AuthRequestLoginCredentials
      | WebAuthnLoginCredentials,
  ): Promise<AuthResult>;

  async logInTwoFactor(
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string = null,
  ): Promise<AuthResult> {
    this.tokenRequest.setTwoFactor(twoFactor);
    const [authResult] = await this.startLogIn();
    return authResult;
  }

  protected async startLogIn(): Promise<[AuthResult, IdentityResponse]> {
    this.twoFactorService.clearSelectedProvider();

    const response = await this.apiService.postIdentityToken(this.tokenRequest);

    if (response instanceof IdentityTwoFactorResponse) {
      return [await this.processTwoFactorResponse(response), response];
    } else if (response instanceof IdentityCaptchaResponse) {
      return [await this.processCaptchaResponse(response), response];
    } else if (response instanceof IdentityTokenResponse) {
      return [await this.processTokenResponse(response), response];
    }

    throw new Error("Invalid response object.");
  }

  protected async buildDeviceRequest() {
    const appId = await this.appIdService.getAppId();
    return new DeviceRequest(appId, this.platformUtilsService);
  }

  protected async buildTwoFactor(userProvidedTwoFactor?: TokenTwoFactorRequest) {
    if (userProvidedTwoFactor != null) {
      return userProvidedTwoFactor;
    }

    const storedTwoFactorToken = await this.tokenService.getTwoFactorToken();
    if (storedTwoFactorToken != null) {
      return new TokenTwoFactorRequest(TwoFactorProviderType.Remember, storedTwoFactorToken, false);
    }

    return new TokenTwoFactorRequest();
  }

  protected async saveAccountInformation(tokenResponse: IdentityTokenResponse) {
    const accountInformation = await this.tokenService.decodeToken(tokenResponse.accessToken);

    // Must persist existing device key if it exists for trusted device decryption to work
    // However, we must provide a user id so that the device key can be retrieved
    // as the state service won't have an active account at this point in time
    // even though the data exists in local storage.
    const userId = accountInformation.sub;

    const deviceKey = await this.stateService.getDeviceKey({ userId });
    const accountKeys = new AccountKeys();
    if (deviceKey) {
      accountKeys.deviceKey = deviceKey;
    }

    // If you don't persist existing admin auth requests on login, they will get deleted.
    const adminAuthRequest = await this.stateService.getAdminAuthRequest({ userId });

    await this.stateService.addAccount(
      new Account({
        profile: {
          ...new AccountProfile(),
          ...{
            userId,
            name: accountInformation.name,
            email: accountInformation.email,
            hasPremiumPersonally: accountInformation.premium,
            kdfIterations: tokenResponse.kdfIterations,
            kdfMemory: tokenResponse.kdfMemory,
            kdfParallelism: tokenResponse.kdfParallelism,
            kdfType: tokenResponse.kdf,
          },
        },
        tokens: {
          ...new AccountTokens(),
          ...{
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
          },
        },
        keys: accountKeys,
        decryptionOptions: AccountDecryptionOptions.fromResponse(tokenResponse),
        adminAuthRequest: adminAuthRequest?.toJSON(),
      }),
    );
  }

  protected async processTokenResponse(response: IdentityTokenResponse): Promise<AuthResult> {
    const result = new AuthResult();

    // Old encryption keys must be migrated, but is currently only available on web.
    // Other clients shouldn't continue the login process.
    if (this.encryptionKeyMigrationRequired(response)) {
      result.requiresEncryptionKeyMigration = true;
      if (this.platformUtilsService.getClientType() !== ClientType.Web) {
        return result;
      }
    }

    result.resetMasterPassword = response.resetMasterPassword;

    // Convert boolean to enum
    if (response.forcePasswordReset) {
      result.forcePasswordReset = ForceSetPasswordReason.AdminForcePasswordReset;
    }

    // Must come before setting keys, user key needs email to update additional keys
    await this.saveAccountInformation(response);

    if (response.twoFactorToken != null) {
      await this.tokenService.setTwoFactorToken(response);
    }

    await this.setMasterKey(response);
    await this.setUserKey(response);
    await this.setPrivateKey(response);

    this.messagingService.send("loggedIn");

    return result;
  }

  // The keys comes from different sources depending on the login strategy
  protected abstract setMasterKey(response: IdentityTokenResponse): Promise<void>;

  protected abstract setUserKey(response: IdentityTokenResponse): Promise<void>;

  protected abstract setPrivateKey(response: IdentityTokenResponse): Promise<void>;

  // Old accounts used master key for encryption. We are forcing migrations but only need to
  // check on password logins
  protected encryptionKeyMigrationRequired(response: IdentityTokenResponse): boolean {
    return false;
  }

  protected async createKeyPairForOldAccount() {
    try {
      const [publicKey, privateKey] = await this.cryptoService.makeKeyPair();
      await this.apiService.postAccountKeys(new KeysRequest(publicKey, privateKey.encryptedString));
      return privateKey.encryptedString;
    } catch (e) {
      this.logService.error(e);
    }
  }

  private async processTwoFactorResponse(response: IdentityTwoFactorResponse): Promise<AuthResult> {
    const result = new AuthResult();
    result.twoFactorProviders = response.twoFactorProviders2;

    this.twoFactorService.setProviders(response);
    this.captchaBypassToken = response.captchaToken ?? null;
    result.ssoEmail2FaSessionToken = response.ssoEmail2faSessionToken;
    result.email = response.email;
    return result;
  }

  private async processCaptchaResponse(response: IdentityCaptchaResponse): Promise<AuthResult> {
    const result = new AuthResult();
    result.captchaSiteKey = response.siteKey;
    return result;
  }
}
