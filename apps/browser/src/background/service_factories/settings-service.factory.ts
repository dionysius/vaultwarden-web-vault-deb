import { SettingsService as AbstractSettingsService } from "@bitwarden/common/abstractions/settings.service";

import { BrowserSettingsService } from "../../services/browser-settings.service";

import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type SettingsServiceFactoryOptions = FactoryOptions;

export type SettingsServiceInitOptions = SettingsServiceFactoryOptions & StateServiceInitOptions;

export function settingsServiceFactory(
  cache: { settingsService?: AbstractSettingsService } & CachedServices,
  opts: SettingsServiceInitOptions
): Promise<AbstractSettingsService> {
  return factory(
    cache,
    "settingsService",
    opts,
    async () => new BrowserSettingsService(await stateServiceFactory(cache, opts))
  );
}
