import { TokenService as AbstractTokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TokenService } from "@bitwarden/common/auth/services/token.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../platform/background/service-factories/state-service.factory";

type TokenServiceFactoryOptions = FactoryOptions;

export type TokenServiceInitOptions = TokenServiceFactoryOptions & StateServiceInitOptions;

export function tokenServiceFactory(
  cache: { tokenService?: AbstractTokenService } & CachedServices,
  opts: TokenServiceInitOptions,
): Promise<AbstractTokenService> {
  return factory(
    cache,
    "tokenService",
    opts,
    async () => new TokenService(await stateServiceFactory(cache, opts)),
  );
}
