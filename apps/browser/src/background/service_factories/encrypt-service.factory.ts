import { EncryptServiceImplementation } from "@bitwarden/common/services/cryptography/encrypt.service.implementation";
import { MultithreadEncryptServiceImplementation } from "@bitwarden/common/services/cryptography/multithread-encrypt.service.implementation";

import { flagEnabled } from "../../flags";

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
  cache: { encryptService?: EncryptServiceImplementation } & CachedServices,
  opts: EncryptServiceInitOptions
): Promise<EncryptServiceImplementation> {
  return factory(cache, "encryptService", opts, async () =>
    flagEnabled("multithreadDecryption")
      ? new MultithreadEncryptServiceImplementation(
          await cryptoFunctionServiceFactory(cache, opts),
          await logServiceFactory(cache, opts),
          opts.encryptServiceOptions.logMacFailures
        )
      : new EncryptServiceImplementation(
          await cryptoFunctionServiceFactory(cache, opts),
          await logServiceFactory(cache, opts),
          opts.encryptServiceOptions.logMacFailures
        )
  );
}
