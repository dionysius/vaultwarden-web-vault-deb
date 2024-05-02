import {
  LogServiceInitOptions,
  logServiceFactory,
} from "../../background/service-factories/log-service.factory";
import { BrowserScriptInjectorService } from "../../services/browser-script-injector.service";

import { CachedServices, FactoryOptions, factory } from "./factory-options";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "./platform-utils-service.factory";

type BrowserScriptInjectorServiceOptions = FactoryOptions;

export type BrowserScriptInjectorServiceInitOptions = BrowserScriptInjectorServiceOptions &
  PlatformUtilsServiceInitOptions &
  LogServiceInitOptions;

export function browserScriptInjectorServiceFactory(
  cache: { browserScriptInjectorService?: BrowserScriptInjectorService } & CachedServices,
  opts: BrowserScriptInjectorServiceInitOptions,
): Promise<BrowserScriptInjectorService> {
  return factory(
    cache,
    "browserScriptInjectorService",
    opts,
    async () =>
      new BrowserScriptInjectorService(
        await platformUtilsServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
      ),
  );
}
