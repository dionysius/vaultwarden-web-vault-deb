import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { CipherService as AbstractCipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";

import {
  apiServiceFactory,
  ApiServiceInitOptions,
} from "../../../background/service_factories/api-service.factory";
import {
  cryptoServiceFactory,
  CryptoServiceInitOptions,
} from "../../../background/service_factories/crypto-service.factory";
import {
  encryptServiceFactory,
  EncryptServiceInitOptions,
} from "../../../background/service_factories/encrypt-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../background/service_factories/factory-options";
import {
  FileUploadServiceInitOptions,
  fileUploadServiceFactory,
} from "../../../background/service_factories/file-upload-service.factory";
import {
  i18nServiceFactory,
  I18nServiceInitOptions,
} from "../../../background/service_factories/i18n-service.factory";
import {
  logServiceFactory,
  LogServiceInitOptions,
} from "../../../background/service_factories/log-service.factory";
import {
  SettingsServiceInitOptions,
  settingsServiceFactory,
} from "../../../background/service_factories/settings-service.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../background/service_factories/state-service.factory";

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
