import {
  PasswordStrengthService,
  PasswordStrengthServiceAbstraction,
} from "@bitwarden/common/tools/password-strength";

import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";

type PasswordStrengthServiceFactoryOptions = FactoryOptions;

export type PasswordStrengthServiceInitOptions = PasswordStrengthServiceFactoryOptions;

export function passwordStrengthServiceFactory(
  cache: {
    passwordStrengthService?: PasswordStrengthServiceAbstraction;
  } & CachedServices,
  opts: PasswordStrengthServiceInitOptions,
): Promise<PasswordStrengthServiceAbstraction> {
  return factory(cache, "passwordStrengthService", opts, async () => new PasswordStrengthService());
}
