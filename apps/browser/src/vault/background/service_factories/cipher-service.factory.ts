import { CipherService as AbstractCipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";

import {
  CipherFileUploadServiceInitOptions,
  cipherFileUploadServiceFactory,
} from "../../../background/service-factories/cipher-file-upload-service.factory";
import {
  searchServiceFactory,
  SearchServiceInitOptions,
} from "../../../background/service-factories/search-service.factory";
import {
  SettingsServiceInitOptions,
  settingsServiceFactory,
} from "../../../background/service-factories/settings-service.factory";
import {
  apiServiceFactory,
  ApiServiceInitOptions,
} from "../../../platform/background/service-factories/api-service.factory";
import {
  configServiceFactory,
  ConfigServiceInitOptions,
} from "../../../platform/background/service-factories/config-service.factory";
import {
  cryptoServiceFactory,
  CryptoServiceInitOptions,
} from "../../../platform/background/service-factories/crypto-service.factory";
import {
  EncryptServiceInitOptions,
  encryptServiceFactory,
} from "../../../platform/background/service-factories/encrypt-service.factory";
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
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../platform/background/service-factories/state-service.factory";

type CipherServiceFactoryOptions = FactoryOptions;

export type CipherServiceInitOptions = CipherServiceFactoryOptions &
  CryptoServiceInitOptions &
  SettingsServiceInitOptions &
  ApiServiceInitOptions &
  CipherFileUploadServiceInitOptions &
  I18nServiceInitOptions &
  SearchServiceInitOptions &
  StateServiceInitOptions &
  EncryptServiceInitOptions &
  ConfigServiceInitOptions;

export function cipherServiceFactory(
  cache: { cipherService?: AbstractCipherService } & CachedServices,
  opts: CipherServiceInitOptions,
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
        await cipherFileUploadServiceFactory(cache, opts),
        await configServiceFactory(cache, opts),
      ),
  );
}
