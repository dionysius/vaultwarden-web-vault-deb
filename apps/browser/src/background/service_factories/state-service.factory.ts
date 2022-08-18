import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import { Account } from "../../models/account";
import { StateService } from "../../services/state.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  stateMigrationServiceFactory,
  StateMigrationServiceInitOptions,
} from "./state-migration-service.factory";
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
  StateMigrationServiceInitOptions;

export function stateServiceFactory(
  cache: { stateService?: StateService } & CachedServices,
  opts: StateServiceInitOptions
): StateService {
  return factory(
    cache,
    "stateService",
    opts,
    () =>
      new StateService(
        diskStorageServiceFactory(cache, opts),
        secureStorageServiceFactory(cache, opts),
        memoryStorageServiceFactory(cache, opts),
        logServiceFactory(cache, opts),
        stateMigrationServiceFactory(cache, opts),
        opts.stateServiceOptions.stateFactory,
        opts.stateServiceOptions.useAccountCache
      )
  );
}
