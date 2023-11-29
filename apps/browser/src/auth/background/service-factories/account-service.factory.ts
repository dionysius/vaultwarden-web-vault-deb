import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AccountServiceImplementation } from "@bitwarden/common/auth/services/account.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  GlobalStateProviderInitOptions,
  globalStateProviderFactory,
} from "../../../platform/background/service-factories/global-state-provider.factory";
import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../../platform/background/service-factories/log-service.factory";
import {
  MessagingServiceInitOptions,
  messagingServiceFactory,
} from "../../../platform/background/service-factories/messaging-service.factory";

type AccountServiceFactoryOptions = FactoryOptions;

export type AccountServiceInitOptions = AccountServiceFactoryOptions &
  MessagingServiceInitOptions &
  LogServiceInitOptions &
  GlobalStateProviderInitOptions;

export function accountServiceFactory(
  cache: { accountService?: AccountService } & CachedServices,
  opts: AccountServiceInitOptions,
): Promise<AccountService> {
  return factory(
    cache,
    "accountService",
    opts,
    async () =>
      new AccountServiceImplementation(
        await messagingServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        await globalStateProviderFactory(cache, opts),
      ),
  );
}
