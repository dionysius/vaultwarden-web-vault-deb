// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AppIdService } from "@bitwarden/common/abstractions/appId.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TokenService } from "@bitwarden/common/abstractions/token.service";
import { TwoFactorService } from "@bitwarden/common/abstractions/twoFactor.service";
import { UserApiLogInStrategy } from "@bitwarden/common/misc/logInStrategies/user-api-login.strategy";
import { Utils } from "@bitwarden/common/misc/utils";
import { UserApiLogInCredentials } from "@bitwarden/common/models/domain/log-in-credentials";

import { identityTokenResponseFactory } from "./logIn.strategy.spec";

describe("UserApiLogInStrategy", () => {
  let cryptoService: SubstituteOf<CryptoService>;
  let apiService: SubstituteOf<ApiService>;
  let tokenService: SubstituteOf<TokenService>;
  let appIdService: SubstituteOf<AppIdService>;
  let platformUtilsService: SubstituteOf<PlatformUtilsService>;
  let messagingService: SubstituteOf<MessagingService>;
  let logService: SubstituteOf<LogService>;
  let environmentService: SubstituteOf<EnvironmentService>;
  let keyConnectorService: SubstituteOf<KeyConnectorService>;
  let stateService: SubstituteOf<StateService>;
  let twoFactorService: SubstituteOf<TwoFactorService>;

  let apiLogInStrategy: UserApiLogInStrategy;
  let credentials: UserApiLogInCredentials;

  const deviceId = Utils.newGuid();
  const keyConnectorUrl = "KEY_CONNECTOR_URL";
  const apiClientId = "API_CLIENT_ID";
  const apiClientSecret = "API_CLIENT_SECRET";

  beforeEach(async () => {
    cryptoService = Substitute.for<CryptoService>();
    apiService = Substitute.for<ApiService>();
    tokenService = Substitute.for<TokenService>();
    appIdService = Substitute.for<AppIdService>();
    platformUtilsService = Substitute.for<PlatformUtilsService>();
    messagingService = Substitute.for<MessagingService>();
    logService = Substitute.for<LogService>();
    environmentService = Substitute.for<EnvironmentService>();
    stateService = Substitute.for<StateService>();
    keyConnectorService = Substitute.for<KeyConnectorService>();
    twoFactorService = Substitute.for<TwoFactorService>();

    appIdService.getAppId().resolves(deviceId);
    tokenService.getTwoFactorToken().resolves(null);

    apiLogInStrategy = new UserApiLogInStrategy(
      cryptoService,
      apiService,
      tokenService,
      appIdService,
      platformUtilsService,
      messagingService,
      logService,
      stateService,
      twoFactorService,
      environmentService,
      keyConnectorService
    );

    credentials = new UserApiLogInCredentials(apiClientId, apiClientSecret);
  });

  it("sends api key credentials to the server", async () => {
    apiService.postIdentityToken(Arg.any()).resolves(identityTokenResponseFactory());
    await apiLogInStrategy.logIn(credentials);

    apiService.received(1).postIdentityToken(
      Arg.is((actual) => {
        const apiTokenRequest = actual as any;
        return (
          apiTokenRequest.clientId === apiClientId &&
          apiTokenRequest.clientSecret === apiClientSecret &&
          apiTokenRequest.device.identifier === deviceId &&
          apiTokenRequest.twoFactor.provider == null &&
          apiTokenRequest.twoFactor.token == null &&
          apiTokenRequest.captchaResponse == null
        );
      })
    );
  });

  it("sets the local environment after a successful login", async () => {
    apiService.postIdentityToken(Arg.any()).resolves(identityTokenResponseFactory());

    await apiLogInStrategy.logIn(credentials);

    stateService.received(1).setApiKeyClientId(apiClientId);
    stateService.received(1).setApiKeyClientSecret(apiClientSecret);
    stateService.received(1).addAccount(Arg.any());
  });

  it("gets and sets the Key Connector key from environmentUrl", async () => {
    const tokenResponse = identityTokenResponseFactory();
    tokenResponse.apiUseKeyConnector = true;

    apiService.postIdentityToken(Arg.any()).resolves(tokenResponse);
    environmentService.getKeyConnectorUrl().returns(keyConnectorUrl);

    await apiLogInStrategy.logIn(credentials);

    keyConnectorService.received(1).getAndSetKey(keyConnectorUrl);
  });
});
