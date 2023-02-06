import { TotpService as AbstractTotpService } from "@bitwarden/common/abstractions/totp.service";
import { TotpService } from "@bitwarden/common/services/totp.service";

import {
  CryptoFunctionServiceInitOptions,
  cryptoFunctionServiceFactory,
} from "../../../background/service_factories/crypto-function-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../background/service_factories/factory-options";
import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../../background/service_factories/log-service.factory";

type TotpServiceOptions = FactoryOptions;

export type TotpServiceInitOptions = TotpServiceOptions &
  CryptoFunctionServiceInitOptions &
  LogServiceInitOptions;

export function totpServiceFactory(
  cache: { totpService?: AbstractTotpService } & CachedServices,
  opts: TotpServiceInitOptions
): Promise<AbstractTotpService> {
  return factory(
    cache,
    "totpService",
    opts,
    async () =>
      new TotpService(
        await cryptoFunctionServiceFactory(cache, opts),
        await logServiceFactory(cache, opts)
      )
  );
}
