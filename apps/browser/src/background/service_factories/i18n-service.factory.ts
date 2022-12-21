import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { I18nServiceImplementation } from "@bitwarden/common/services/i18n.service.implementation";

import BrowserI18nServiceImplementation from "../../services/browser-i18n.service.implementation";

import { FactoryOptions, CachedServices, factory } from "./factory-options";

type I18nServiceFactoryOptions = FactoryOptions & {
  i18nServiceOptions: {
    systemLanguage: string;
  };
};

export type I18nServiceInitOptions = I18nServiceFactoryOptions;

export async function i18nServiceFactory(
  cache: { i18nService?: I18nService } & CachedServices,
  opts: I18nServiceInitOptions
): Promise<I18nService> {
  const service = await factory(
    cache,
    "i18nService",
    opts,
    () => new BrowserI18nServiceImplementation(opts.i18nServiceOptions.systemLanguage)
  );
  if (!(service as I18nServiceImplementation as any).inited) {
    await (service as I18nServiceImplementation).init();
  }
  return service;
}
