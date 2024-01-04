import { DerivedStateProvider } from "@bitwarden/common/platform/state";

import { BackgroundDerivedStateProvider } from "../../state/background-derived-state.provider";

import { CachedServices, FactoryOptions, factory } from "./factory-options";
import {
  MemoryStorageServiceInitOptions,
  observableMemoryStorageServiceFactory,
} from "./storage-service.factory";

type DerivedStateProviderFactoryOptions = FactoryOptions;

export type DerivedStateProviderInitOptions = DerivedStateProviderFactoryOptions &
  MemoryStorageServiceInitOptions;

export async function derivedStateProviderFactory(
  cache: { derivedStateProvider?: DerivedStateProvider } & CachedServices,
  opts: DerivedStateProviderInitOptions,
): Promise<DerivedStateProvider> {
  return factory(
    cache,
    "derivedStateProvider",
    opts,
    async () =>
      new BackgroundDerivedStateProvider(await observableMemoryStorageServiceFactory(cache, opts)),
  );
}
