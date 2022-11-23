import { FolderService as AbstractFolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";

import { BrowserFolderService } from "../../services/browser-folder.service";

import { cipherServiceFactory, CipherServiceInitOptions } from "./cipher-service.factory";
import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { i18nServiceFactory, I18nServiceInitOptions } from "./i18n-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";

type FolderServiceFactoryOptions = FactoryOptions;

export type FolderServiceInitOptions = FolderServiceFactoryOptions &
  CryptoServiceInitOptions &
  CipherServiceInitOptions &
  I18nServiceInitOptions &
  StateServiceInitOptions;

export function folderServiceFactory(
  cache: { folderService?: AbstractFolderService } & CachedServices,
  opts: FolderServiceInitOptions
): Promise<AbstractFolderService> {
  return factory(
    cache,
    "folderService",
    opts,
    async () =>
      new BrowserFolderService(
        await cryptoServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        await cipherServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts)
      )
  );
}
