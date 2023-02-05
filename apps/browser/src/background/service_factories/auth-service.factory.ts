import { AuthService as AbstractAuthService } from "@bitwarden/common/abstractions/auth.service";
import { AuthService } from "@bitwarden/common/services/auth.service";

import { apiServiceFactory, ApiServiceInitOptions } from "./api-service.factory";
import { appIdServiceFactory } from "./app-id-service.factory";
import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { EncryptServiceInitOptions, encryptServiceFactory } from "./encrypt-service.factory";
import {
  environmentServiceFactory,
  EnvironmentServiceInitOptions,
} from "./environment-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { I18nServiceInitOptions, i18nServiceFactory } from "./i18n-service.factory";
import {
  KeyConnectorServiceInitOptions,
  keyConnectorServiceFactory,
} from "./key-connector-service.factory";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import { MessagingServiceInitOptions, messagingServiceFactory } from "./messaging-service.factory";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "./platform-utils-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";
import { TokenServiceInitOptions, tokenServiceFactory } from "./token-service.factory";
import { TwoFactorServiceInitOptions, twoFactorServiceFactory } from "./two-factor-service.factory";

type AuthServiceFactoyOptions = FactoryOptions;

export type AuthServiceInitOptions = AuthServiceFactoyOptions &
  CryptoServiceInitOptions &
  ApiServiceInitOptions &
  TokenServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  MessagingServiceInitOptions &
  LogServiceInitOptions &
  KeyConnectorServiceInitOptions &
  EnvironmentServiceInitOptions &
  StateServiceInitOptions &
  TwoFactorServiceInitOptions &
  I18nServiceInitOptions &
  EncryptServiceInitOptions;

export function authServiceFactory(
  cache: { authService?: AbstractAuthService } & CachedServices,
  opts: AuthServiceInitOptions
): Promise<AbstractAuthService> {
  return factory(
    cache,
    "authService",
    opts,
    async () =>
      new AuthService(
        await cryptoServiceFactory(cache, opts),
        await apiServiceFactory(cache, opts),
        await tokenServiceFactory(cache, opts),
        await appIdServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await messagingServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        await keyConnectorServiceFactory(cache, opts),
        await environmentServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await twoFactorServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts)
      )
  );
}
