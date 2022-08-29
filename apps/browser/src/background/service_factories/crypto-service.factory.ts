import { CryptoService as AbstractCryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoService } from "@bitwarden/common/services/crypto.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { encryptServiceFactory, EncryptServiceInitOptions } from "./encrypt-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  platformUtilsServiceFactory,
  PlatformUtilsServiceInitOptions,
} from "./platform-utils-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type CryptoServiceFactoryOptions = FactoryOptions;

export type CryptoServiceInitOptions = CryptoServiceFactoryOptions &
  CryptoFunctionServiceInitOptions &
  EncryptServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  LogServiceInitOptions &
  StateServiceInitOptions;

export function cryptoServiceFactory(
  cache: { cryptoService?: AbstractCryptoService } & CachedServices,
  opts: CryptoServiceInitOptions
): Promise<AbstractCryptoService> {
  return factory(
    cache,
    "cryptoService",
    opts,
    async () =>
      new CryptoService(
        await cryptoFunctionServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts)
      )
  );
}
