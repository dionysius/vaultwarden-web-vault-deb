import {
  accountServiceFactory,
  AccountServiceInitOptions,
} from "../../../auth/background/service-factories/account-service.factory";
import { BrowserEnvironmentService } from "../../services/browser-environment.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import { stateProviderFactory, StateProviderInitOptions } from "./state-provider.factory";

type EnvironmentServiceFactoryOptions = FactoryOptions;

export type EnvironmentServiceInitOptions = EnvironmentServiceFactoryOptions &
  StateProviderInitOptions &
  AccountServiceInitOptions &
  LogServiceInitOptions;

export function environmentServiceFactory(
  cache: { environmentService?: BrowserEnvironmentService } & CachedServices,
  opts: EnvironmentServiceInitOptions,
): Promise<BrowserEnvironmentService> {
  return factory(
    cache,
    "environmentService",
    opts,
    async () =>
      new BrowserEnvironmentService(
        await logServiceFactory(cache, opts),
        await stateProviderFactory(cache, opts),
        await accountServiceFactory(cache, opts),
      ),
  );
}
