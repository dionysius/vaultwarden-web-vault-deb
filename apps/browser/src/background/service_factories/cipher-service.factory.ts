import { CipherService as AbstractCipherService } from "@bitwarden/common/abstractions/cipher.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { CipherService } from "@bitwarden/common/services/cipher.service";

import { apiServiceFactory, ApiServiceInitOptions } from "./api-service.factory";
import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { encryptServiceFactory, EncryptServiceInitOptions } from "./encrypt-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  FileUploadServiceInitOptions,
  fileUploadServiceFactory,
} from "./file-upload-service.factory";
import { i18nServiceFactory, I18nServiceInitOptions } from "./i18n-service.factory";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import { SettingsServiceInitOptions, settingsServiceFactory } from "./settings-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type CipherServiceFactoryOptions = FactoryOptions & {
  cipherServiceOptions?: {
    searchServiceFactory?: () => SearchService;
  };
};

export type CipherServiceInitOptions = CipherServiceFactoryOptions &
  CryptoServiceInitOptions &
  SettingsServiceInitOptions &
  ApiServiceInitOptions &
  FileUploadServiceInitOptions &
  I18nServiceInitOptions &
  LogServiceInitOptions &
  StateServiceInitOptions &
  EncryptServiceInitOptions;

export function cipherServiceFactory(
  cache: { cipherService?: AbstractCipherService } & CachedServices,
  opts: CipherServiceInitOptions
): Promise<AbstractCipherService> {
  return factory(
    cache,
    "cipherService",
    opts,
    async () =>
      new CipherService(
        await cryptoServiceFactory(cache, opts),
        await settingsServiceFactory(cache, opts),
        await apiServiceFactory(cache, opts),
        await fileUploadServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        opts.cipherServiceOptions?.searchServiceFactory === undefined
          ? () => cache.searchService as SearchService
          : opts.cipherServiceOptions.searchServiceFactory,
        await logServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts)
      )
  );
}
