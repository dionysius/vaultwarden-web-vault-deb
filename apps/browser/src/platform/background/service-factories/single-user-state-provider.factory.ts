import { SingleUserStateProvider } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- We need the implementation to inject, but generally this should not be accessed
import { DefaultSingleUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-single-user-state.provider";

import { EncryptServiceInitOptions, encryptServiceFactory } from "./encrypt-service.factory";
import { CachedServices, FactoryOptions, factory } from "./factory-options";
import {
  DiskStorageServiceInitOptions,
  MemoryStorageServiceInitOptions,
  observableDiskStorageServiceFactory,
  observableMemoryStorageServiceFactory,
} from "./storage-service.factory";

type SingleUserStateProviderFactoryOptions = FactoryOptions;

export type SingleUserStateProviderInitOptions = SingleUserStateProviderFactoryOptions &
  EncryptServiceInitOptions &
  MemoryStorageServiceInitOptions &
  DiskStorageServiceInitOptions;

export async function singleUserStateProviderFactory(
  cache: { singleUserStateProvider?: SingleUserStateProvider } & CachedServices,
  opts: SingleUserStateProviderInitOptions,
): Promise<SingleUserStateProvider> {
  return factory(
    cache,
    "singleUserStateProvider",
    opts,
    async () =>
      new DefaultSingleUserStateProvider(
        await encryptServiceFactory(cache, opts),
        await observableMemoryStorageServiceFactory(cache, opts),
        await observableDiskStorageServiceFactory(cache, opts),
      ),
  );
}
