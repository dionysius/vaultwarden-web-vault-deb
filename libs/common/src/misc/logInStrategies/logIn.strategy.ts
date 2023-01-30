import { ApiService } from "../../abstractions/api.service";
import { AppIdService } from "../../abstractions/appId.service";
import { CryptoService } from "../../abstractions/crypto.service";
import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { StateService } from "../../abstractions/state.service";
import { TokenService } from "../../abstractions/token.service";
import { TwoFactorService } from "../../abstractions/twoFactor.service";
import { TwoFactorProviderType } from "../../enums/twoFactorProviderType";
import { Account, AccountProfile, AccountTokens } from "../../models/domain/account";
import { AuthResult } from "../../models/domain/auth-result";
import {
  UserApiLogInCredentials,
  PasswordLogInCredentials,
  SsoLogInCredentials,
  PasswordlessLogInCredentials,
} from "../../models/domain/log-in-credentials";
import { DeviceRequest } from "../../models/request/device.request";
import { PasswordTokenRequest } from "../../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../../models/request/identity-token/sso-token.request";
import { TokenTwoFactorRequest } from "../../models/request/identity-token/token-two-factor.request";
import { UserApiTokenRequest } from "../../models/request/identity-token/user-api-token.request";
import { KeysRequest } from "../../models/request/keys.request";
import { IdentityCaptchaResponse } from "../../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../../models/response/identity-two-factor.response";

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
    return this.startLogIn();
  }

  protected async startLogIn(): Promise<AuthResult> {
    this.twoFactorService.clearSelectedProvider();

    const response = await this.apiService.postIdentityToken(this.tokenRequest);

    if (response instanceof IdentityTwoFactorResponse) {
      return this.processTwoFactorResponse(response);
    } else if (response instanceof IdentityCaptchaResponse) {
      return this.processCaptchaResponse(response);
    } else if (response instanceof IdentityTokenResponse) {
      return this.processTokenResponse(response);
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
    result.forcePasswordReset = response.forcePasswordReset;

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
