import { ApiService } from "../../abstractions/api.service";
import { AppIdService } from "../../abstractions/appId.service";
import { AuthService } from "../../abstractions/auth.service";
import { CryptoService } from "../../abstractions/crypto.service";
import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { StateService } from "../../abstractions/state.service";
import { TokenService } from "../../abstractions/token.service";
import { TwoFactorService } from "../../abstractions/twoFactor.service";
import { AuthResult } from "../../models/domain/auth-result";
import { PasswordlessLogInCredentials } from "../../models/domain/log-in-credentials";
import { PasswordTokenRequest } from "../../models/request/identity-token/password-token.request";
import { TokenTwoFactorRequest } from "../../models/request/identity-token/token-two-factor.request";

import { LogInStrategy } from "./logIn.strategy";

export class PasswordlessLogInStrategy extends LogInStrategy {
  get email() {
    return this.tokenRequest.email;
  }

  get accessCode() {
    return this.passwordlessCredentials.accessCode;
  }

  get authRequestId() {
    return this.passwordlessCredentials.authRequestId;
  }

  tokenRequest: PasswordTokenRequest;
  private passwordlessCredentials: PasswordlessLogInCredentials;

  constructor(
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    appIdService: AppIdService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    logService: LogService,
    stateService: StateService,
    twoFactorService: TwoFactorService,
    private authService: AuthService
  ) {
    super(
      cryptoService,
      apiService,
      tokenService,
      appIdService,
      platformUtilsService,
      messagingService,
      logService,
      stateService,
      twoFactorService
    );
  }

  async onSuccessfulLogin() {
    await this.cryptoService.setKey(this.passwordlessCredentials.decKey);
    await this.cryptoService.setKeyHash(this.passwordlessCredentials.localPasswordHash);
  }

  async logInTwoFactor(
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string
  ): Promise<AuthResult> {
    this.tokenRequest.captchaResponse = captchaResponse ?? this.captchaBypassToken;
    return super.logInTwoFactor(twoFactor);
  }

  async logIn(credentials: PasswordlessLogInCredentials) {
    this.passwordlessCredentials = credentials;

    this.tokenRequest = new PasswordTokenRequest(
      credentials.email,
      credentials.accessCode,
      null,
      await this.buildTwoFactor(credentials.twoFactor),
      await this.buildDeviceRequest()
    );

    this.tokenRequest.setPasswordlessAccessCode(credentials.authRequestId);
    return this.startLogIn();
  }
}
