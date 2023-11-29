import { CryptoService as AbstractCryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";

import {
  StateServiceInitOptions,
  stateServiceFactory,
} from "../../../platform/background/service-factories/state-service.factory";
import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../background/service-factories/log-service.factory";
import { BrowserCryptoService } from "../../services/browser-crypto.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { encryptServiceFactory, EncryptServiceInitOptions } from "./encrypt-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "./platform-utils-service.factory";

type CryptoServiceFactoryOptions = FactoryOptions;

export type CryptoServiceInitOptions = CryptoServiceFactoryOptions &
  CryptoFunctionServiceInitOptions &
  EncryptServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  LogServiceInitOptions &
  StateServiceInitOptions;

export function cryptoServiceFactory(
  cache: { cryptoService?: AbstractCryptoService } & CachedServices,
  opts: CryptoServiceInitOptions,
): Promise<AbstractCryptoService> {
  return factory(
    cache,
    "cryptoService",
    opts,
    async () =>
      new BrowserCryptoService(
        await cryptoFunctionServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
      ),
  );
}
