import { StateFactory } from "@bitwarden/common/platform/factories/state-factory";
import { GlobalState } from "@bitwarden/common/platform/models/domain/global-state";

import {
  accountServiceFactory,
  AccountServiceInitOptions,
} from "../../../auth/background/service-factories/account-service.factory";
import { Account } from "../../../models/account";
import { BrowserStateService } from "../../services/browser-state.service";

import {
  environmentServiceFactory,
  EnvironmentServiceInitOptions,
} from "./environment-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  diskStorageServiceFactory,
  secureStorageServiceFactory,
  memoryStorageServiceFactory,
  DiskStorageServiceInitOptions,
  SecureStorageServiceInitOptions,
  MemoryStorageServiceInitOptions,
} from "./storage-service.factory";

type StateServiceFactoryOptions = FactoryOptions & {
  stateServiceOptions: {
    useAccountCache?: boolean;
    stateFactory: StateFactory<GlobalState, Account>;
  };
};

export type StateServiceInitOptions = StateServiceFactoryOptions &
  DiskStorageServiceInitOptions &
  SecureStorageServiceInitOptions &
  MemoryStorageServiceInitOptions &
  LogServiceInitOptions &
  AccountServiceInitOptions &
  EnvironmentServiceInitOptions;

export async function stateServiceFactory(
  cache: { stateService?: BrowserStateService } & CachedServices,
  opts: StateServiceInitOptions,
): Promise<BrowserStateService> {
  const service = await factory(
    cache,
    "stateService",
    opts,
    async () =>
      new BrowserStateService(
        await diskStorageServiceFactory(cache, opts),
        await secureStorageServiceFactory(cache, opts),
        await memoryStorageServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        opts.stateServiceOptions.stateFactory,
        await accountServiceFactory(cache, opts),
        await environmentServiceFactory(cache, opts),
        opts.stateServiceOptions.useAccountCache,
      ),
  );
  // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  service.init();
  return service;
}
