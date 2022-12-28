import { mock, MockProxy } from "jest-mock-extended";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AppIdService } from "@bitwarden/common/abstractions/appId.service";
import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TokenService } from "@bitwarden/common/abstractions/token.service";
import { TwoFactorService } from "@bitwarden/common/abstractions/twoFactor.service";
import { HashPurpose } from "@bitwarden/common/enums/hashPurpose";
import { PasswordLogInStrategy } from "@bitwarden/common/misc/logInStrategies/passwordLogin.strategy";
import { Utils } from "@bitwarden/common/misc/utils";
import { PasswordLogInCredentials } from "@bitwarden/common/models/domain/log-in-credentials";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";

import { identityTokenResponseFactory } from "./logIn.strategy.spec";

const email = "hello@world.com";
const masterPassword = "password";
const hashedPassword = "HASHED_PASSWORD";
const localHashedPassword = "LOCAL_HASHED_PASSWORD";
const preloginKey = new SymmetricCryptoKey(
  Utils.fromB64ToArray(
    "N2KWjlLpfi5uHjv+YcfUKIpZ1l+W+6HRensmIqD+BFYBf6N/dvFpJfWwYnVBdgFCK2tJTAIMLhqzIQQEUmGFgg=="
  )
);
const deviceId = Utils.newGuid();

describe("PasswordLogInStrategy", () => {
  let cryptoService: MockProxy<CryptoService>;
  let apiService: MockProxy<ApiService>;
  let tokenService: MockProxy<TokenService>;
  let appIdService: MockProxy<AppIdService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let messagingService: MockProxy<MessagingService>;
  let logService: MockProxy<LogService>;
  let stateService: MockProxy<StateService>;
  let twoFactorService: MockProxy<TwoFactorService>;
  let authService: MockProxy<AuthService>;

  let passwordLogInStrategy: PasswordLogInStrategy;
  let credentials: PasswordLogInCredentials;

  beforeEach(async () => {
    cryptoService = mock<CryptoService>();
    apiService = mock<ApiService>();
    tokenService = mock<TokenService>();
    appIdService = mock<AppIdService>();
    platformUtilsService = mock<PlatformUtilsService>();
    messagingService = mock<MessagingService>();
    logService = mock<LogService>();
    stateService = mock<StateService>();
    twoFactorService = mock<TwoFactorService>();
    authService = mock<AuthService>();

    appIdService.getAppId.mockResolvedValue(deviceId);
    tokenService.decodeToken.mockResolvedValue({});

    authService.makePreloginKey.mockResolvedValue(preloginKey);

    cryptoService.hashPassword
      .calledWith(masterPassword, expect.anything(), undefined)
      .mockResolvedValue(hashedPassword);
    cryptoService.hashPassword
      .calledWith(masterPassword, expect.anything(), HashPurpose.LocalAuthorization)
      .mockResolvedValue(localHashedPassword);

    passwordLogInStrategy = new PasswordLogInStrategy(
      cryptoService,
      apiService,
      tokenService,
      appIdService,
      platformUtilsService,
      messagingService,
      logService,
      stateService,
      twoFactorService,
      authService
    );
    credentials = new PasswordLogInCredentials(email, masterPassword);

    apiService.postIdentityToken.mockResolvedValue(identityTokenResponseFactory());
  });

  it("sends master password credentials to the server", async () => {
    await passwordLogInStrategy.logIn(credentials);

    expect(apiService.postIdentityToken).toHaveBeenCalledWith(
      expect.objectContaining({
        email: email,
        masterPasswordHash: hashedPassword,
        device: expect.objectContaining({
          identifier: deviceId,
        }),
        twoFactor: expect.objectContaining({
          provider: null,
          token: null,
        }),
        captchaResponse: undefined,
      })
    );
  });

  it("sets the local environment after a successful login", async () => {
    await passwordLogInStrategy.logIn(credentials);

    expect(cryptoService.setKey).toHaveBeenCalledWith(preloginKey);
    expect(cryptoService.setKeyHash).toHaveBeenCalledWith(localHashedPassword);
  });
});
