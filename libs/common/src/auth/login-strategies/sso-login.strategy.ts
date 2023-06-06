import { ApiService } from "../../abstractions/api.service";
import { AppIdService } from "../../platform/abstractions/app-id.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { LogService } from "../../platform/abstractions/log.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";
import { StateService } from "../../platform/abstractions/state.service";
import { KeyConnectorService } from "../abstractions/key-connector.service";
import { TokenService } from "../abstractions/token.service";
import { TwoFactorService } from "../abstractions/two-factor.service";
import { SsoLogInCredentials } from "../models/domain/log-in-credentials";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { IdentityTokenResponse } from "../models/response/identity-token.response";

import { LogInStrategy } from "./login.strategy";

export class SsoLogInStrategy extends LogInStrategy {
  tokenRequest: SsoTokenRequest;
  orgId: string;

  // A session token server side to serve as an authentication factor for the user
  // in order to send email OTPs to the user's configured 2FA email address
  // as we don't have a master password hash or other verifiable secret when using SSO.
  ssoEmail2FaSessionToken?: string;
  email?: string; // email not preserved through SSO process so get from server

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
    private keyConnectorService: KeyConnectorService
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

  async setUserKey(tokenResponse: IdentityTokenResponse) {
    const newSsoUser = tokenResponse.key == null;

    if (tokenResponse.keyConnectorUrl != null) {
      if (!newSsoUser) {
        await this.keyConnectorService.getAndSetKey(tokenResponse.keyConnectorUrl);
      } else {
        await this.keyConnectorService.convertNewSsoUserToKeyConnector(tokenResponse, this.orgId);
      }
    }
  }

  async logIn(credentials: SsoLogInCredentials) {
    this.orgId = credentials.orgId;
    this.tokenRequest = new SsoTokenRequest(
      credentials.code,
      credentials.codeVerifier,
      credentials.redirectUrl,
      await this.buildTwoFactor(credentials.twoFactor),
      await this.buildDeviceRequest()
    );

    const [ssoAuthResult] = await this.startLogIn();

    this.email = ssoAuthResult.email;
    this.ssoEmail2FaSessionToken = ssoAuthResult.ssoEmail2FaSessionToken;

    return ssoAuthResult;
  }
}
