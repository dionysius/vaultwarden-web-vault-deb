import { KeyGenerationService } from "../../services/keyGeneration.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";

type KeyGenerationServiceFactoryOptions = FactoryOptions;

export type KeyGenerationServiceInitOptions = KeyGenerationServiceFactoryOptions &
  CryptoFunctionServiceInitOptions;

export function keyGenerationServiceFactory(
  cache: { keyGenerationService?: KeyGenerationService } & CachedServices,
  opts: KeyGenerationServiceInitOptions
): KeyGenerationService {
  return factory(
    cache,
    "keyGenerationService",
    opts,
    () => new KeyGenerationService(cryptoFunctionServiceFactory(cache, opts))
  );
}
