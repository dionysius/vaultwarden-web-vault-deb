import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { WebCryptoFunctionService } from "@bitwarden/common/platform/services/web-crypto-function.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";

type CryptoFunctionServiceFactoryOptions = FactoryOptions & {
  cryptoFunctionServiceOptions: {
    win: Window | typeof globalThis;
  };
};

export type CryptoFunctionServiceInitOptions = CryptoFunctionServiceFactoryOptions;

export function cryptoFunctionServiceFactory(
  cache: { cryptoFunctionService?: CryptoFunctionService } & CachedServices,
  opts: CryptoFunctionServiceFactoryOptions,
): Promise<CryptoFunctionService> {
  return factory(
    cache,
    "cryptoFunctionService",
    opts,
    () => new WebCryptoFunctionService(opts.cryptoFunctionServiceOptions.win),
  );
}
