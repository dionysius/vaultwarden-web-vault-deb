import { KeyGenerationService } from "../../services/key-generation.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";

type KeyGenerationServiceFactoryOptions = FactoryOptions;

export type KeyGenerationServiceInitOptions = KeyGenerationServiceFactoryOptions &
  CryptoFunctionServiceInitOptions;

export function keyGenerationServiceFactory(
  cache: { keyGenerationService?: KeyGenerationService } & CachedServices,
  opts: KeyGenerationServiceInitOptions,
): Promise<KeyGenerationService> {
  return factory(
    cache,
    "keyGenerationService",
    opts,
    async () => new KeyGenerationService(await cryptoFunctionServiceFactory(cache, opts)),
  );
}
