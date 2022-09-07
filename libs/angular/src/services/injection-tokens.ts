import { InjectionToken } from "@angular/core";

import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";

export const WINDOW = new InjectionToken<Window>("WINDOW");
export const MEMORY_STORAGE = new InjectionToken<AbstractStorageService>("MEMORY_STORAGE");
export const SECURE_STORAGE = new InjectionToken<AbstractStorageService>("SECURE_STORAGE");
export const STATE_FACTORY = new InjectionToken<StateFactory>("STATE_FACTORY");
export const STATE_SERVICE_USE_CACHE = new InjectionToken<boolean>("STATE_SERVICE_USE_CACHE");
export const LOGOUT_CALLBACK = new InjectionToken<(expired: boolean, userId?: string) => void>(
  "LOGOUT_CALLBACK"
);
export const LOCKED_CALLBACK = new InjectionToken<() => void>("LOCKED_CALLBACK");
export const CLIENT_TYPE = new InjectionToken<boolean>("CLIENT_TYPE");
export const LOCALES_DIRECTORY = new InjectionToken<string>("LOCALES_DIRECTORY");
export const SYSTEM_LANGUAGE = new InjectionToken<string>("SYSTEM_LANGUAGE");
export const LOG_MAC_FAILURES = new InjectionToken<string>("LOG_MAC_FAILURES");
