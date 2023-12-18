import { StateProvider } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- We need the implementation to inject, but generally this should not be accessed
import { DefaultStateProvider } from "@bitwarden/common/platform/state/implementations/default-state.provider";

import {
  ActiveUserStateProviderInitOptions,
  activeUserStateProviderFactory,
} from "./active-user-state-provider.factory";
import { CachedServices, FactoryOptions, factory } from "./factory-options";
import {
  GlobalStateProviderInitOptions,
  globalStateProviderFactory,
} from "./global-state-provider.factory";
import {
  SingleUserStateProviderInitOptions,
  singleUserStateProviderFactory,
} from "./single-user-state-provider.factory";

type StateProviderFactoryOptions = FactoryOptions;

export type StateProviderInitOptions = StateProviderFactoryOptions &
  GlobalStateProviderInitOptions &
  ActiveUserStateProviderInitOptions &
  SingleUserStateProviderInitOptions;

export async function stateProviderFactory(
  cache: { stateProvider?: StateProvider } & CachedServices,
  opts: StateProviderInitOptions,
): Promise<StateProvider> {
  return factory(
    cache,
    "stateProvider",
    opts,
    async () =>
      new DefaultStateProvider(
        await activeUserStateProviderFactory(cache, opts),
        await singleUserStateProviderFactory(cache, opts),
        await globalStateProviderFactory(cache, opts),
      ),
  );
}
