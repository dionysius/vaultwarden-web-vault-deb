import { PasswordGenerationService as AbstractPasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PasswordGenerationService } from "@bitwarden/common/services/passwordGeneration.service";

import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { policyServiceFactory, PolicyServiceInitOptions } from "./policy-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type PasswordGenerationServiceFactoryOptions = FactoryOptions;

export type PasswordGenerationServiceInitOptions = PasswordGenerationServiceFactoryOptions &
  CryptoServiceInitOptions &
  PolicyServiceInitOptions &
  StateServiceInitOptions;

export function passwordGenerationServiceFactory(
  cache: { passwordGenerationService?: AbstractPasswordGenerationService } & CachedServices,
  opts: PasswordGenerationServiceInitOptions
): Promise<AbstractPasswordGenerationService> {
  return factory(
    cache,
    "passwordGenerationService",
    opts,
    async () =>
      new PasswordGenerationService(
        await cryptoServiceFactory(cache, opts),
        await policyServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts)
      )
  );
}
