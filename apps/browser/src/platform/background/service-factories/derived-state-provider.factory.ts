import { DerivedStateProvider } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- For dependency creation
import { InlineDerivedStateProvider } from "@bitwarden/common/platform/state/implementations/inline-derived-state";

import { CachedServices, FactoryOptions, factory } from "./factory-options";

type DerivedStateProviderFactoryOptions = FactoryOptions;

export type DerivedStateProviderInitOptions = DerivedStateProviderFactoryOptions;

export async function derivedStateProviderFactory(
  cache: { derivedStateProvider?: DerivedStateProvider } & CachedServices,
  opts: DerivedStateProviderInitOptions,
): Promise<DerivedStateProvider> {
  return factory(cache, "derivedStateProvider", opts, async () => new InlineDerivedStateProvider());
}
