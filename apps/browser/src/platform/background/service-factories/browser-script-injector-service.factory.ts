import { BrowserScriptInjectorService } from "../../services/browser-script-injector.service";

import { CachedServices, FactoryOptions, factory } from "./factory-options";

type BrowserScriptInjectorServiceOptions = FactoryOptions;

export type BrowserScriptInjectorServiceInitOptions = BrowserScriptInjectorServiceOptions;

export function browserScriptInjectorServiceFactory(
  cache: { browserScriptInjectorService?: BrowserScriptInjectorService } & CachedServices,
  opts: BrowserScriptInjectorServiceInitOptions,
): Promise<BrowserScriptInjectorService> {
  return factory(
    cache,
    "browserScriptInjectorService",
    opts,
    async () => new BrowserScriptInjectorService(),
  );
}
