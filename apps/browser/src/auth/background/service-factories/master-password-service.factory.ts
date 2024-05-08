import {
  InternalMasterPasswordServiceAbstraction,
  MasterPasswordServiceAbstraction,
} from "@bitwarden/common/auth/abstractions/master-password.service.abstraction";
import { MasterPasswordService } from "@bitwarden/common/auth/services/master-password/master-password.service";

import {
  encryptServiceFactory,
  EncryptServiceInitOptions,
} from "../../../platform/background/service-factories/encrypt-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";
import {
  keyGenerationServiceFactory,
  KeyGenerationServiceInitOptions,
} from "../../../platform/background/service-factories/key-generation-service.factory";
import {
  stateProviderFactory,
  StateProviderInitOptions,
} from "../../../platform/background/service-factories/state-provider.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../platform/background/service-factories/state-service.factory";

type MasterPasswordServiceFactoryOptions = FactoryOptions;

export type MasterPasswordServiceInitOptions = MasterPasswordServiceFactoryOptions &
  StateProviderInitOptions &
  StateServiceInitOptions &
  KeyGenerationServiceInitOptions &
  EncryptServiceInitOptions;

export function internalMasterPasswordServiceFactory(
  cache: { masterPasswordService?: InternalMasterPasswordServiceAbstraction } & CachedServices,
  opts: MasterPasswordServiceInitOptions,
): Promise<InternalMasterPasswordServiceAbstraction> {
  return factory(
    cache,
    "masterPasswordService",
    opts,
    async () =>
      new MasterPasswordService(
        await stateProviderFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await keyGenerationServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
      ),
  );
}

export async function masterPasswordServiceFactory(
  cache: { masterPasswordService?: InternalMasterPasswordServiceAbstraction } & CachedServices,
  opts: MasterPasswordServiceInitOptions,
): Promise<MasterPasswordServiceAbstraction> {
  return (await internalMasterPasswordServiceFactory(
    cache,
    opts,
  )) as MasterPasswordServiceAbstraction;
}
