import { EncryptServiceImplementation } from "@bitwarden/common/platform/services/cryptography/encrypt.service.implementation";

import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../background/service-factories/log-service.factory";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";

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
  opts: EncryptServiceInitOptions,
): Promise<EncryptServiceImplementation> {
  return factory(
    cache,
    "encryptService",
    opts,
    async () =>
      new EncryptServiceImplementation(
        await cryptoFunctionServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        opts.encryptServiceOptions.logMacFailures,
      ),
  );
}
