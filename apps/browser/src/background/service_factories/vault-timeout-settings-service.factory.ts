import { VaultTimeoutSettingsService as AbstractVaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/services/vaultTimeout/vaultTimeoutSettings.service";

import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { policyServiceFactory, PolicyServiceInitOptions } from "./policy-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";
import { tokenServiceFactory, TokenServiceInitOptions } from "./token-service.factory";

type VaultTimeoutSettingsServiceFactoryOptions = FactoryOptions;

export type VaultTimeoutSettingsServiceInitOptions = VaultTimeoutSettingsServiceFactoryOptions &
  CryptoServiceInitOptions &
  TokenServiceInitOptions &
  PolicyServiceInitOptions &
  StateServiceInitOptions;

export function vaultTimeoutSettingsServiceFactory(
  cache: { vaultTimeoutSettingsService?: AbstractVaultTimeoutSettingsService } & CachedServices,
  opts: VaultTimeoutSettingsServiceInitOptions
): Promise<AbstractVaultTimeoutSettingsService> {
  return factory(
    cache,
    "vaultTimeoutSettingsService",
    opts,
    async () =>
      new VaultTimeoutSettingsService(
        await cryptoServiceFactory(cache, opts),
        await tokenServiceFactory(cache, opts),
        await policyServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts)
      )
  );
}
