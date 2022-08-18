import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { WebCryptoFunctionService } from "@bitwarden/common/services/webCryptoFunction.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";

type CryptoFunctionServiceFactoryOptions = FactoryOptions & {
  cryptoFunctionServiceOptions: {
    win: Window | typeof global;
  };
};

export type CryptoFunctionServiceInitOptions = CryptoFunctionServiceFactoryOptions;

export function cryptoFunctionServiceFactory(
  cache: { cryptoFunctionService?: CryptoFunctionService } & CachedServices,
  opts: CryptoFunctionServiceFactoryOptions
): CryptoFunctionService {
  return factory(
    cache,
    "cryptoFunctionService",
    opts,
    () => new WebCryptoFunctionService(opts.cryptoFunctionServiceOptions.win)
  );
}
