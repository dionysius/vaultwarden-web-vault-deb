import { PinCryptoServiceAbstraction, PinCryptoService } from "@bitwarden/auth/common";

import {
  VaultTimeoutSettingsServiceInitOptions,
  vaultTimeoutSettingsServiceFactory,
} from "../../../background/service-factories/vault-timeout-settings-service.factory";
import {
  CryptoServiceInitOptions,
  cryptoServiceFactory,
} from "../../../platform/background/service-factories/crypto-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../../platform/background/service-factories/log-service.factory";
import {
  StateServiceInitOptions,
  stateServiceFactory,
} from "../../../platform/background/service-factories/state-service.factory";

type PinCryptoServiceFactoryOptions = FactoryOptions;

export type PinCryptoServiceInitOptions = PinCryptoServiceFactoryOptions &
  StateServiceInitOptions &
  CryptoServiceInitOptions &
  VaultTimeoutSettingsServiceInitOptions &
  LogServiceInitOptions;

export function pinCryptoServiceFactory(
  cache: { pinCryptoService?: PinCryptoServiceAbstraction } & CachedServices,
  opts: PinCryptoServiceInitOptions,
): Promise<PinCryptoServiceAbstraction> {
  return factory(
    cache,
    "pinCryptoService",
    opts,
    async () =>
      new PinCryptoService(
        await stateServiceFactory(cache, opts),
        await cryptoServiceFactory(cache, opts),
        await vaultTimeoutSettingsServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
      ),
  );
}
