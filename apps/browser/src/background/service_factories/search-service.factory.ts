import { SearchService as AbstractSearchService } from "@bitwarden/common/abstractions/search.service";
import { SearchService } from "@bitwarden/common/services/search.service";

import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../vault/background/service_factories/cipher-service.factory";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { i18nServiceFactory, I18nServiceInitOptions } from "./i18n-service.factory";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";

type SearchServiceFactoryOptions = FactoryOptions;

export type SearchServiceInitOptions = SearchServiceFactoryOptions &
  CipherServiceInitOptions &
  LogServiceInitOptions &
  I18nServiceInitOptions;

export function searchServiceFactory(
  cache: { searchService?: AbstractSearchService } & CachedServices,
  opts: SearchServiceInitOptions
): Promise<AbstractSearchService> {
  return factory(
    cache,
    "searchService",
    opts,
    async () =>
      new SearchService(
        await cipherServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts)
      )
  );
}
