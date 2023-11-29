import { GlobalStateProvider } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- We need the implementation to inject, but generally this should not be accessed
import { DefaultGlobalStateProvider } from "@bitwarden/common/platform/state/implementations/default-global-state.provider";

import { CachedServices, FactoryOptions, factory } from "./factory-options";
import {
  DiskStorageServiceInitOptions,
  MemoryStorageServiceInitOptions,
  observableDiskStorageServiceFactory,
  observableMemoryStorageServiceFactory,
} from "./storage-service.factory";

type GlobalStateProviderFactoryOptions = FactoryOptions;

export type GlobalStateProviderInitOptions = GlobalStateProviderFactoryOptions &
  MemoryStorageServiceInitOptions &
  DiskStorageServiceInitOptions;

export async function globalStateProviderFactory(
  cache: { globalStateProvider?: GlobalStateProvider } & CachedServices,
  opts: GlobalStateProviderInitOptions,
): Promise<GlobalStateProvider> {
  return factory(
    cache,
    "globalStateProvider",
    opts,
    async () =>
      new DefaultGlobalStateProvider(
        await observableMemoryStorageServiceFactory(cache, opts),
        await observableDiskStorageServiceFactory(cache, opts),
      ),
  );
}
