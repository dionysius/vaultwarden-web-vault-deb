import { KdfConfigService as AbstractKdfConfigService } from "@bitwarden/common/auth/abstractions/kdf-config.service";
import { KdfConfigService } from "@bitwarden/common/auth/services/kdf-config.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  StateProviderInitOptions,
  stateProviderFactory,
} from "../../../platform/background/service-factories/state-provider.factory";

type KdfConfigServiceFactoryOptions = FactoryOptions;

export type KdfConfigServiceInitOptions = KdfConfigServiceFactoryOptions & StateProviderInitOptions;

export function kdfConfigServiceFactory(
  cache: { kdfConfigService?: AbstractKdfConfigService } & CachedServices,
  opts: KdfConfigServiceInitOptions,
): Promise<AbstractKdfConfigService> {
  return factory(
    cache,
    "kdfConfigService",
    opts,
    async () => new KdfConfigService(await stateProviderFactory(cache, opts)),
  );
}
