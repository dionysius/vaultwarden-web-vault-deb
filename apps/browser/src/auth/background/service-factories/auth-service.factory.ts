import { AuthService as AbstractAuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthService } from "@bitwarden/common/auth/services/auth.service";

import {
  policyServiceFactory,
  PolicyServiceInitOptions,
} from "../../../admin-console/background/service-factories/policy-service.factory";
import {
  apiServiceFactory,
  ApiServiceInitOptions,
} from "../../../background/service_factories/api-service.factory";
import { appIdServiceFactory } from "../../../background/service_factories/app-id-service.factory";
import {
  cryptoServiceFactory,
  CryptoServiceInitOptions,
} from "../../../background/service_factories/crypto-service.factory";
import {
  encryptServiceFactory,
  EncryptServiceInitOptions,
} from "../../../background/service_factories/encrypt-service.factory";
import {
  environmentServiceFactory,
  EnvironmentServiceInitOptions,
} from "../../../background/service_factories/environment-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../background/service_factories/factory-options";
import {
  i18nServiceFactory,
  I18nServiceInitOptions,
} from "../../../background/service_factories/i18n-service.factory";
import {
  logServiceFactory,
  LogServiceInitOptions,
} from "../../../background/service_factories/log-service.factory";
import {
  messagingServiceFactory,
  MessagingServiceInitOptions,
} from "../../../background/service_factories/messaging-service.factory";
import {
  passwordGenerationServiceFactory,
  PasswordGenerationServiceInitOptions,
} from "../../../background/service_factories/password-generation-service.factory";
import {
  platformUtilsServiceFactory,
  PlatformUtilsServiceInitOptions,
} from "../../../background/service_factories/platform-utils-service.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../background/service_factories/state-service.factory";

import {
  keyConnectorServiceFactory,
  KeyConnectorServiceInitOptions,
} from "./key-connector-service.factory";
import { tokenServiceFactory, TokenServiceInitOptions } from "./token-service.factory";
import { twoFactorServiceFactory, TwoFactorServiceInitOptions } from "./two-factor-service.factory";

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
  EncryptServiceInitOptions &
  PolicyServiceInitOptions &
  PasswordGenerationServiceInitOptions;

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
        await encryptServiceFactory(cache, opts),
        await passwordGenerationServiceFactory(cache, opts),
        await policyServiceFactory(cache, opts)
      )
  );
}
