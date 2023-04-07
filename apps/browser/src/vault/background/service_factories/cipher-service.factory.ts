import { CipherService as AbstractCipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";

import {
  apiServiceFactory,
  ApiServiceInitOptions,
} from "../../../background/service_factories/api-service.factory";
import {
  CipherFileUploadServiceInitOptions,
  cipherFileUploadServiceFactory,
} from "../../../background/service_factories/cipher-file-upload-service.factory";
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
  i18nServiceFactory,
  I18nServiceInitOptions,
} from "../../../background/service_factories/i18n-service.factory";
import {
  searchServiceFactory,
  SearchServiceInitOptions,
} from "../../../background/service_factories/search-service.factory";
import {
  SettingsServiceInitOptions,
  settingsServiceFactory,
} from "../../../background/service_factories/settings-service.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../background/service_factories/state-service.factory";

type CipherServiceFactoryOptions = FactoryOptions;

export type CipherServiceInitOptions = CipherServiceFactoryOptions &
  CryptoServiceInitOptions &
  SettingsServiceInitOptions &
  ApiServiceInitOptions &
  CipherFileUploadServiceInitOptions &
  I18nServiceInitOptions &
  SearchServiceInitOptions &
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
        await i18nServiceFactory(cache, opts),
        await searchServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
        await cipherFileUploadServiceFactory(cache, opts)
      )
  );
}
