import { StateFactory } from "@bitwarden/common/platform/factories/state-factory";
import { GlobalState } from "@bitwarden/common/platform/models/domain/global-state";
import { StateMigrationService } from "@bitwarden/common/platform/services/state-migration.service";

import { Account } from "../../../models/account";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  diskStorageServiceFactory,
  DiskStorageServiceInitOptions,
  secureStorageServiceFactory,
  SecureStorageServiceInitOptions,
} from "./storage-service.factory";

type StateMigrationServiceFactoryOptions = FactoryOptions & {
  stateMigrationServiceOptions: {
    stateFactory: StateFactory<GlobalState, Account>;
  };
};

export type StateMigrationServiceInitOptions = StateMigrationServiceFactoryOptions &
  DiskStorageServiceInitOptions &
  SecureStorageServiceInitOptions;

export function stateMigrationServiceFactory(
  cache: { stateMigrationService?: StateMigrationService } & CachedServices,
  opts: StateMigrationServiceInitOptions
): Promise<StateMigrationService> {
  return factory(
    cache,
    "stateMigrationService",
    opts,
    async () =>
      new StateMigrationService(
        await diskStorageServiceFactory(cache, opts),
        await secureStorageServiceFactory(cache, opts),
        opts.stateMigrationServiceOptions.stateFactory
      )
  );
}
