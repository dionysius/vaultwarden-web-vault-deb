import { SsoLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/sso-login.service.abstraction";
import { SsoLoginService } from "@bitwarden/common/auth/services/sso-login.service";

import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";
import {
  stateProviderFactory,
  StateProviderInitOptions,
} from "../../../platform/background/service-factories/state-provider.factory";

type SsoLoginServiceFactoryOptions = FactoryOptions;

export type SsoLoginServiceInitOptions = SsoLoginServiceFactoryOptions & StateProviderInitOptions;

export function ssoLoginServiceFactory(
  cache: { ssoLoginService?: SsoLoginServiceAbstraction } & CachedServices,
  opts: SsoLoginServiceInitOptions,
): Promise<SsoLoginServiceAbstraction> {
  return factory(
    cache,
    "ssoLoginService",
    opts,
    async () => new SsoLoginService(await stateProviderFactory(cache, opts)),
  );
}
