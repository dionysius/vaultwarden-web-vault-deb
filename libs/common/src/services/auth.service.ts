import { Observable, Subject } from "rxjs";

import { ApiService } from "../abstractions/api.service";
import { AppIdService } from "../abstractions/appId.service";
import { AuthService as AuthServiceAbstraction } from "../abstractions/auth.service";
import { CryptoService } from "../abstractions/crypto.service";
import { EnvironmentService } from "../abstractions/environment.service";
import { I18nService } from "../abstractions/i18n.service";
import { KeyConnectorService } from "../abstractions/keyConnector.service";
import { LogService } from "../abstractions/log.service";
import { MessagingService } from "../abstractions/messaging.service";
import { PlatformUtilsService } from "../abstractions/platformUtils.service";
import { StateService } from "../abstractions/state.service";
import { TokenService } from "../abstractions/token.service";
import { TwoFactorService } from "../abstractions/twoFactor.service";
import { AuthenticationStatus } from "../enums/authenticationStatus";
import { AuthenticationType } from "../enums/authenticationType";
import { KdfType } from "../enums/kdfType";
import { KeySuffixOptions } from "../enums/keySuffixOptions";
import { PasswordLogInStrategy } from "../misc/logInStrategies/passwordLogin.strategy";
import { PasswordlessLogInStrategy } from "../misc/logInStrategies/passwordlessLogin.strategy";
import { SsoLogInStrategy } from "../misc/logInStrategies/ssoLogin.strategy";
import { UserApiLogInStrategy } from "../misc/logInStrategies/user-api-login.strategy";
import { AuthResult } from "../models/domain/auth-result";
import { KdfConfig } from "../models/domain/kdf-config";
import {
  UserApiLogInCredentials,
  PasswordLogInCredentials,
  SsoLogInCredentials,
  PasswordlessLogInCredentials,
} from "../models/domain/log-in-credentials";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";
import { PreloginRequest } from "../models/request/prelogin.request";
import { ErrorResponse } from "../models/response/error.response";
import { AuthRequestPushNotification } from "../models/response/notification.response";

const sessionTimeoutLength = 2 * 60 * 1000; // 2 minutes

export class AuthService implements AuthServiceAbstraction {
  get email(): string {
    if (
      this.logInStrategy instanceof PasswordLogInStrategy ||
      this.logInStrategy instanceof PasswordlessLogInStrategy
    ) {
      return this.logInStrategy.email;
    }

    return null;
  }

  get masterPasswordHash(): string {
    return this.logInStrategy instanceof PasswordLogInStrategy
      ? this.logInStrategy.masterPasswordHash
      : null;
  }

  get accessCode(): string {
    return this.logInStrategy instanceof PasswordlessLogInStrategy
      ? this.logInStrategy.accessCode
      : null;
  }

  get authRequestId(): string {
    return this.logInStrategy instanceof PasswordlessLogInStrategy
      ? this.logInStrategy.authRequestId
      : null;
  }

  private logInStrategy:
    | UserApiLogInStrategy
    | PasswordLogInStrategy
    | SsoLogInStrategy
    | PasswordlessLogInStrategy;
  private sessionTimeout: any;

  private pushNotificationSubject = new Subject<string>();

  constructor(
    protected cryptoService: CryptoService,
    protected apiService: ApiService,
    protected tokenService: TokenService,
    protected appIdService: AppIdService,
    protected platformUtilsService: PlatformUtilsService,
    protected messagingService: MessagingService,
    protected logService: LogService,
    protected keyConnectorService: KeyConnectorService,
    protected environmentService: EnvironmentService,
    protected stateService: StateService,
    protected twoFactorService: TwoFactorService,
    protected i18nService: I18nService
  ) {}

  async logIn(
    credentials:
      | UserApiLogInCredentials
      | PasswordLogInCredentials
      | SsoLogInCredentials
      | PasswordlessLogInCredentials
  ): Promise<AuthResult> {
    this.clearState();

    let strategy:
      | UserApiLogInStrategy
      | PasswordLogInStrategy
      | SsoLogInStrategy
      | PasswordlessLogInStrategy;

    switch (credentials.type) {
      case AuthenticationType.Password:
        strategy = new PasswordLogInStrategy(
          this.cryptoService,
          this.apiService,
          this.tokenService,
          this.appIdService,
          this.platformUtilsService,
          this.messagingService,
          this.logService,
          this.stateService,
          this.twoFactorService,
          this
        );
        break;
      case AuthenticationType.Sso:
        strategy = new SsoLogInStrategy(
          this.cryptoService,
          this.apiService,
          this.tokenService,
          this.appIdService,
          this.platformUtilsService,
          this.messagingService,
          this.logService,
          this.stateService,
          this.twoFactorService,
          this.keyConnectorService
        );
        break;
      case AuthenticationType.UserApi:
        strategy = new UserApiLogInStrategy(
          this.cryptoService,
          this.apiService,
          this.tokenService,
          this.appIdService,
          this.platformUtilsService,
          this.messagingService,
          this.logService,
          this.stateService,
          this.twoFactorService,
          this.environmentService,
          this.keyConnectorService
        );
        break;
      case AuthenticationType.Passwordless:
        strategy = new PasswordlessLogInStrategy(
          this.cryptoService,
          this.apiService,
          this.tokenService,
          this.appIdService,
          this.platformUtilsService,
          this.messagingService,
          this.logService,
          this.stateService,
          this.twoFactorService,
          this
        );
        break;
    }

    const result = await strategy.logIn(credentials as any);

    if (result?.requiresTwoFactor) {
      this.saveState(strategy);
    }
    return result;
  }

  async logInTwoFactor(
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string
  ): Promise<AuthResult> {
    if (this.logInStrategy == null) {
      throw new Error(this.i18nService.t("sessionTimeout"));
    }

    try {
      const result = await this.logInStrategy.logInTwoFactor(twoFactor, captchaResponse);

      // Only clear state if 2FA token has been accepted, otherwise we need to be able to try again
      if (!result.requiresTwoFactor && !result.requiresCaptcha) {
        this.clearState();
      }
      return result;
    } catch (e) {
      // API exceptions are okay, but if there are any unhandled client-side errors then clear state to be safe
      if (!(e instanceof ErrorResponse)) {
        this.clearState();
      }
      throw e;
    }
  }

  logOut(callback: () => void) {
    callback();
    this.messagingService.send("loggedOut");
  }

  authingWithUserApiKey(): boolean {
    return this.logInStrategy instanceof UserApiLogInStrategy;
  }

  authingWithSso(): boolean {
    return this.logInStrategy instanceof SsoLogInStrategy;
  }

  authingWithPassword(): boolean {
    return this.logInStrategy instanceof PasswordLogInStrategy;
  }

  authingWithPasswordless(): boolean {
    return this.logInStrategy instanceof PasswordlessLogInStrategy;
  }

  async getAuthStatus(userId?: string): Promise<AuthenticationStatus> {
    const isAuthenticated = await this.stateService.getIsAuthenticated({ userId: userId });
    if (!isAuthenticated) {
      return AuthenticationStatus.LoggedOut;
    }

    // Keys aren't stored for a device that is locked or logged out
    // Make sure we're logged in before checking this, otherwise we could mix up those states
    const neverLock =
      (await this.cryptoService.hasKeyStored(KeySuffixOptions.Auto, userId)) &&
      !(await this.stateService.getEverBeenUnlocked({ userId: userId }));
    if (neverLock) {
      // TODO: This also _sets_ the key so when we check memory in the next line it finds a key.
      // We should refactor here.
      await this.cryptoService.getKey(KeySuffixOptions.Auto, userId);
    }

    const hasKeyInMemory = await this.cryptoService.hasKeyInMemory(userId);
    if (!hasKeyInMemory) {
      return AuthenticationStatus.Locked;
    }

    return AuthenticationStatus.Unlocked;
  }

  async makePreloginKey(masterPassword: string, email: string): Promise<SymmetricCryptoKey> {
    email = email.trim().toLowerCase();
    let kdf: KdfType = null;
    let kdfConfig: KdfConfig = null;
    try {
      const preloginResponse = await this.apiService.postPrelogin(new PreloginRequest(email));
      if (preloginResponse != null) {
        kdf = preloginResponse.kdf;
        kdfConfig = new KdfConfig(
          preloginResponse.kdfIterations,
          preloginResponse.kdfMemory,
          preloginResponse.kdfParallelism
        );
      }
    } catch (e) {
      if (e == null || e.statusCode !== 404) {
        throw e;
      }
    }
    return this.cryptoService.makeKey(masterPassword, email, kdf, kdfConfig);
  }

  async authResponsePushNotifiction(notification: AuthRequestPushNotification): Promise<any> {
    this.pushNotificationSubject.next(notification.id);
  }

  getPushNotifcationObs$(): Observable<any> {
    return this.pushNotificationSubject.asObservable();
  }

  private saveState(
    strategy:
      | UserApiLogInStrategy
      | PasswordLogInStrategy
      | SsoLogInStrategy
      | PasswordlessLogInStrategy
  ) {
    this.logInStrategy = strategy;
    this.startSessionTimeout();
  }

  private clearState() {
    this.logInStrategy = null;
    this.clearSessionTimeout();
  }

  private startSessionTimeout() {
    this.clearSessionTimeout();
    this.sessionTimeout = setTimeout(() => this.clearState(), sessionTimeoutLength);
  }

  private clearSessionTimeout() {
    if (this.sessionTimeout != null) {
      clearTimeout(this.sessionTimeout);
    }
  }
}
