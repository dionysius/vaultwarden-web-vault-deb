import { EncryptService } from "@bitwarden/common/services/encrypt.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { LogServiceInitOptions, logServiceFactory } from "./log-service.factory";

type EncryptServiceFactoryOptions = FactoryOptions & {
  encryptServiceOptions: {
    logMacFailures: boolean;
  };
};

export type EncryptServiceInitOptions = EncryptServiceFactoryOptions &
  CryptoFunctionServiceInitOptions &
  LogServiceInitOptions;

export function encryptServiceFactory(
  cache: { encryptService?: EncryptService } & CachedServices,
  opts: EncryptServiceInitOptions
): Promise<EncryptService> {
  return factory(
    cache,
    "encryptService",
    opts,
    async () =>
      new EncryptService(
        await cryptoFunctionServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        opts.encryptServiceOptions.logMacFailures
      )
  );
}
