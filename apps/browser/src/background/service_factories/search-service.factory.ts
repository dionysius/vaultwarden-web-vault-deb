import { SearchService as AbstractSearchService } from "@bitwarden/common/abstractions/search.service";
import { SearchService } from "@bitwarden/common/services/search.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { i18nServiceFactory, I18nServiceInitOptions } from "./i18n-service.factory";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";

type SearchServiceFactoryOptions = FactoryOptions;

export type SearchServiceInitOptions = SearchServiceFactoryOptions &
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
      new SearchService(await logServiceFactory(cache, opts), await i18nServiceFactory(cache, opts))
  );
}
