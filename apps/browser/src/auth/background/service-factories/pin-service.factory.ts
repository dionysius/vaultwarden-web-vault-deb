import { PinServiceAbstraction, PinService } from "@bitwarden/auth/common";

import {
  CryptoFunctionServiceInitOptions,
  cryptoFunctionServiceFactory,
} from "../../../platform/background/service-factories/crypto-function-service.factory";
import {
  EncryptServiceInitOptions,
  encryptServiceFactory,
} from "../../../platform/background/service-factories/encrypt-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  KeyGenerationServiceInitOptions,
  keyGenerationServiceFactory,
} from "../../../platform/background/service-factories/key-generation-service.factory";
import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../../platform/background/service-factories/log-service.factory";
import {
  StateProviderInitOptions,
  stateProviderFactory,
} from "../../../platform/background/service-factories/state-provider.factory";
import {
  StateServiceInitOptions,
  stateServiceFactory,
} from "../../../platform/background/service-factories/state-service.factory";

import { AccountServiceInitOptions, accountServiceFactory } from "./account-service.factory";
import { KdfConfigServiceInitOptions, kdfConfigServiceFactory } from "./kdf-config-service.factory";
import {
  MasterPasswordServiceInitOptions,
  masterPasswordServiceFactory,
} from "./master-password-service.factory";

type PinServiceFactoryOptions = FactoryOptions;

export type PinServiceInitOptions = PinServiceFactoryOptions &
  AccountServiceInitOptions &
  CryptoFunctionServiceInitOptions &
  EncryptServiceInitOptions &
  KdfConfigServiceInitOptions &
  KeyGenerationServiceInitOptions &
  LogServiceInitOptions &
  MasterPasswordServiceInitOptions &
  StateProviderInitOptions &
  StateServiceInitOptions;

export function pinServiceFactory(
  cache: { pinService?: PinServiceAbstraction } & CachedServices,
  opts: PinServiceInitOptions,
): Promise<PinServiceAbstraction> {
  return factory(
    cache,
    "pinService",
    opts,
    async () =>
      new PinService(
        await accountServiceFactory(cache, opts),
        await cryptoFunctionServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
        await kdfConfigServiceFactory(cache, opts),
        await keyGenerationServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        await masterPasswordServiceFactory(cache, opts),
        await stateProviderFactory(cache, opts),
        await stateServiceFactory(cache, opts),
      ),
  );
}
