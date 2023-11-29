import { TotpService as AbstractTotpService } from "@bitwarden/common/vault/abstractions/totp.service";
import { TotpService } from "@bitwarden/common/vault/services/totp.service";

import {
  CryptoFunctionServiceInitOptions,
  cryptoFunctionServiceFactory,
} from "../../../platform/background/service-factories/crypto-function-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../../platform/background/service-factories/log-service.factory";

type TotpServiceOptions = FactoryOptions;

export type TotpServiceInitOptions = TotpServiceOptions &
  CryptoFunctionServiceInitOptions &
  LogServiceInitOptions;

export function totpServiceFactory(
  cache: { totpService?: AbstractTotpService } & CachedServices,
  opts: TotpServiceInitOptions,
): Promise<AbstractTotpService> {
  return factory(
    cache,
    "totpService",
    opts,
    async () =>
      new TotpService(
        await cryptoFunctionServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
      ),
  );
}
