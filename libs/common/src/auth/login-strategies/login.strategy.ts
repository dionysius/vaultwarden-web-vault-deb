import { ApiService } from "../../abstractions/api.service";
import { KeysRequest } from "../../models/request/keys.request";
import { AppIdService } from "../../platform/abstractions/app-id.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { LogService } from "../../platform/abstractions/log.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";
import { StateService } from "../../platform/abstractions/state.service";
import { Account, AccountProfile, AccountTokens } from "../../platform/models/domain/account";
import { TokenService } from "../abstractions/token.service";
import { TwoFactorService } from "../abstractions/two-factor.service";
import { TwoFactorProviderType } from "../enums/two-factor-provider-type";
import { AuthResult } from "../models/domain/auth-result";
import { ForceResetPasswordReason } from "../models/domain/force-reset-password-reason";
import {
  PasswordlessLogInCredentials,
  PasswordLogInCredentials,
  SsoLogInCredentials,
  UserApiLogInCredentials,
} from "../models/domain/log-in-credentials";
import { DeviceRequest } from "../models/request/identity-token/device.request";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { IdentityCaptchaResponse } from "../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../models/response/identity-two-factor.response";

type IdentityResponse = IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse;

export abstract class LogInStrategy {
  protected abstract tokenRequest: UserApiTokenRequest | PasswordTokenRequest | SsoTokenRequest;
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
    protected twoFactorService: TwoFactorService
  ) {}

  abstract logIn(
    credentials:
      | UserApiLogInCredentials
      | PasswordLogInCredentials
      | SsoLogInCredentials
      | PasswordlessLogInCredentials
  ): Promise<AuthResult>;

  // The user key comes from different sources depending on the login strategy
  protected abstract setUserKey(response: IdentityTokenResponse): Promise<void>;

  async logInTwoFactor(
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string = null
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
    await this.stateService.addAccount(
      new Account({
        profile: {
          ...new AccountProfile(),
          ...{
            userId: accountInformation.sub,
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
      })
    );
  }

  protected async processTokenResponse(response: IdentityTokenResponse): Promise<AuthResult> {
    const result = new AuthResult();
    result.resetMasterPassword = response.resetMasterPassword;

    if (response.forcePasswordReset) {
      result.forcePasswordReset = ForceResetPasswordReason.AdminForcePasswordReset;
    }

    await this.saveAccountInformation(response);

    if (response.twoFactorToken != null) {
      await this.tokenService.setTwoFactorToken(response);
    }

    await this.setUserKey(response);

    // Must come after the user Key is set, otherwise createKeyPairForOldAccount will fail
    const newSsoUser = response.key == null;
    if (!newSsoUser) {
      await this.cryptoService.setEncKey(response.key);
      await this.cryptoService.setEncPrivateKey(
        response.privateKey ?? (await this.createKeyPairForOldAccount())
      );
    }

    this.messagingService.send("loggedIn");

    return result;
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

  private async createKeyPairForOldAccount() {
    try {
      const [publicKey, privateKey] = await this.cryptoService.makeKeyPair();
      await this.apiService.postAccountKeys(new KeysRequest(publicKey, privateKey.encryptedString));
      return privateKey.encryptedString;
    } catch (e) {
      this.logService.error(e);
    }
  }
}
