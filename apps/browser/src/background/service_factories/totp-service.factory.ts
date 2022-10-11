import { TotpService as AbstractTotpService } from "@bitwarden/common/abstractions/totp.service";
import { TotpService } from "@bitwarden/common/services/totp.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";

type TotpServiceOptions = FactoryOptions;

export type TotpServiceInitOptions = TotpServiceOptions &
  CryptoFunctionServiceInitOptions &
  LogServiceInitOptions;

export function totpServiceFacotry(
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
