import { KeyConnectorService as AbstractKeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { KeyConnectorService } from "@bitwarden/common/auth/services/key-connector.service";

import {
  apiServiceFactory,
  ApiServiceInitOptions,
} from "../../../background/service_factories/api-service.factory";
import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "../../../background/service_factories/crypto-function-service.factory";
import {
  CryptoServiceInitOptions,
  cryptoServiceFactory,
} from "../../../background/service_factories/crypto-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../background/service_factories/factory-options";
import {
  logServiceFactory,
  LogServiceInitOptions,
} from "../../../background/service_factories/log-service.factory";
import {
  OrganizationServiceInitOptions,
  organizationServiceFactory,
} from "../../../background/service_factories/organization-service.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../background/service_factories/state-service.factory";

import { TokenServiceInitOptions, tokenServiceFactory } from "./token-service.factory";

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
