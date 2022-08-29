import { KeyConnectorService as AbstractKeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { KeyConnectorService } from "@bitwarden/common/services/keyConnector.service";

import { apiServiceFactory, ApiServiceInitOptions } from "./api-service.factory";
import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { CryptoServiceInitOptions, cryptoServiceFactory } from "./crypto-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  OrganizationServiceInitOptions,
  organizationServiceFactory,
} from "./organization-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";
import { tokenServiceFactory, TokenServiceInitOptions } from "./token-service.factory";

type KeyConnectorServiceFactoryOptions = FactoryOptions & {
  keyConnectorServiceOptions: {
    logoutCallback: (expired: boolean, userId?: string) => Promise<void>;
  };
};

export type KeyConnectorServiceInitOptions = KeyConnectorServiceFactoryOptions &
  StateServiceInitOptions &
  CryptoServiceInitOptions &
  ApiServiceInitOptions &
  TokenServiceInitOptions &
  LogServiceInitOptions &
  OrganizationServiceInitOptions &
  CryptoFunctionServiceInitOptions;

export function keyConnectorServiceFactory(
  cache: { keyConnectorService?: AbstractKeyConnectorService } & CachedServices,
  opts: KeyConnectorServiceInitOptions
): Promise<AbstractKeyConnectorService> {
  return factory(
    cache,
    "keyConnectorService",
    opts,
    async () =>
      new KeyConnectorService(
        await stateServiceFactory(cache, opts),
        await cryptoServiceFactory(cache, opts),
        await apiServiceFactory(cache, opts),
        await tokenServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        await organizationServiceFactory(cache, opts),
        await cryptoFunctionServiceFactory(cache, opts),
        opts.keyConnectorServiceOptions.logoutCallback
      )
  );
}
