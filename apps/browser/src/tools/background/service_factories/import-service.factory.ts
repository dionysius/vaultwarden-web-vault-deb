import { ImportService, ImportServiceAbstraction } from "@bitwarden/importer/core";

import {
  cryptoServiceFactory,
  CryptoServiceInitOptions,
} from "../../../platform/background/service-factories/crypto-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";
import {
  i18nServiceFactory,
  I18nServiceInitOptions,
} from "../../../platform/background/service-factories/i18n-service.factory";
import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../../vault/background/service_factories/cipher-service.factory";
import {
  collectionServiceFactory,
  CollectionServiceInitOptions,
} from "../../../vault/background/service_factories/collection-service.factory";
import {
  folderServiceFactory,
  FolderServiceInitOptions,
} from "../../../vault/background/service_factories/folder-service.factory";

import { importApiServiceFactory, ImportApiServiceInitOptions } from "./import-api-service.factory";

type ImportServiceFactoryOptions = FactoryOptions;

export type ImportServiceInitOptions = ImportServiceFactoryOptions &
  CipherServiceInitOptions &
  FolderServiceInitOptions &
  ImportApiServiceInitOptions &
  I18nServiceInitOptions &
  CollectionServiceInitOptions &
  CryptoServiceInitOptions;

export function importServiceFactory(
  cache: {
    importService?: ImportServiceAbstraction;
  } & CachedServices,
  opts: ImportServiceInitOptions,
): Promise<ImportServiceAbstraction> {
  return factory(
    cache,
    "importService",
    opts,
    async () =>
      new ImportService(
        await cipherServiceFactory(cache, opts),
        await folderServiceFactory(cache, opts),
        await importApiServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        await collectionServiceFactory(cache, opts),
        await cryptoServiceFactory(cache, opts),
      ),
  );
}
