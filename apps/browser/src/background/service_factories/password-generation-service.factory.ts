import {
  PasswordGenerationService,
  PasswordGenerationServiceAbstraction,
} from "@bitwarden/common/tools/generator/password";

import {
  policyServiceFactory,
  PolicyServiceInitOptions,
} from "../../admin-console/background/service-factories/policy-service.factory";

import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type PasswordGenerationServiceFactoryOptions = FactoryOptions;

export type PasswordGenerationServiceInitOptions = PasswordGenerationServiceFactoryOptions &
  CryptoServiceInitOptions &
  PolicyServiceInitOptions &
  StateServiceInitOptions;

export function passwordGenerationServiceFactory(
  cache: { passwordGenerationService?: PasswordGenerationServiceAbstraction } & CachedServices,
  opts: PasswordGenerationServiceInitOptions
): Promise<PasswordGenerationServiceAbstraction> {
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
