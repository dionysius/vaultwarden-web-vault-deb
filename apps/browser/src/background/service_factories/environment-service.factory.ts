import { BrowserEnvironmentService } from "../../services/browser-environment.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";

type EnvironmentServiceFactoryOptions = FactoryOptions;

export type EnvironmentServiceInitOptions = EnvironmentServiceFactoryOptions &
  StateServiceInitOptions &
  LogServiceInitOptions;

export function environmentServiceFactory(
  cache: { environmentService?: BrowserEnvironmentService } & CachedServices,
  opts: EnvironmentServiceInitOptions
): BrowserEnvironmentService {
  return factory(
    cache,
    "environmentService",
    opts,
    () =>
      new BrowserEnvironmentService(
        stateServiceFactory(cache, opts),
        logServiceFactory(cache, opts)
      )
  );
}
