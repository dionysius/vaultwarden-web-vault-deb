import { CollectionService as AbstractCollectionService } from "@bitwarden/common/abstractions/collection.service";
import { CollectionService } from "@bitwarden/common/services/collection.service";

import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { i18nServiceFactory, I18nServiceInitOptions } from "./i18n-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";

type CollectionServiceFactoryOptions = FactoryOptions;

export type CollectionServiceInitOptions = CollectionServiceFactoryOptions &
  CryptoServiceInitOptions &
  I18nServiceInitOptions &
  StateServiceInitOptions;

export function collectionServiceFactory(
  cache: { collectionService?: AbstractCollectionService } & CachedServices,
  opts: CollectionServiceInitOptions
): Promise<AbstractCollectionService> {
  return factory(
    cache,
    "collectionService",
    opts,
    async () =>
      new CollectionService(
        await cryptoServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts)
      )
  );
}
