import { DeviceTrustServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust.service.abstraction";
import { DeviceTrustService } from "@bitwarden/common/auth/services/device-trust.service.implementation";

import {
  DevicesApiServiceInitOptions,
  devicesApiServiceFactory,
} from "../../../background/service-factories/devices-api-service.factory";
import {
  AppIdServiceInitOptions,
  appIdServiceFactory,
} from "../../../platform/background/service-factories/app-id-service.factory";
import {
  CryptoFunctionServiceInitOptions,
  cryptoFunctionServiceFactory,
} from "../../../platform/background/service-factories/crypto-function-service.factory";
import {
  CryptoServiceInitOptions,
  cryptoServiceFactory,
} from "../../../platform/background/service-factories/crypto-service.factory";
import {
  EncryptServiceInitOptions,
  encryptServiceFactory,
} from "../../../platform/background/service-factories/encrypt-service.factory";
import {
  CachedServices,
  FactoryOptions,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  I18nServiceInitOptions,
  i18nServiceFactory,
} from "../../../platform/background/service-factories/i18n-service.factory";
import {
  KeyGenerationServiceInitOptions,
  keyGenerationServiceFactory,
} from "../../../platform/background/service-factories/key-generation-service.factory";
import { logServiceFactory } from "../../../platform/background/service-factories/log-service.factory";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "../../../platform/background/service-factories/platform-utils-service.factory";
import {
  StateProviderInitOptions,
  stateProviderFactory,
} from "../../../platform/background/service-factories/state-provider.factory";
import {
  SecureStorageServiceInitOptions,
  secureStorageServiceFactory,
} from "../../../platform/background/service-factories/storage-service.factory";

import {
  UserDecryptionOptionsServiceInitOptions,
  userDecryptionOptionsServiceFactory,
} from "./user-decryption-options-service.factory";

type DeviceTrustServiceFactoryOptions = FactoryOptions;

export type DeviceTrustServiceInitOptions = DeviceTrustServiceFactoryOptions &
  KeyGenerationServiceInitOptions &
  CryptoFunctionServiceInitOptions &
  CryptoServiceInitOptions &
  EncryptServiceInitOptions &
  AppIdServiceInitOptions &
  DevicesApiServiceInitOptions &
  I18nServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  StateProviderInitOptions &
  SecureStorageServiceInitOptions &
  UserDecryptionOptionsServiceInitOptions;

export function deviceTrustServiceFactory(
  cache: { deviceTrustService?: DeviceTrustServiceAbstraction } & CachedServices,
  opts: DeviceTrustServiceInitOptions,
): Promise<DeviceTrustServiceAbstraction> {
  return factory(
    cache,
    "deviceTrustService",
    opts,
    async () =>
      new DeviceTrustService(
        await keyGenerationServiceFactory(cache, opts),
        await cryptoFunctionServiceFactory(cache, opts),
        await cryptoServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
        await appIdServiceFactory(cache, opts),
        await devicesApiServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await stateProviderFactory(cache, opts),
        await secureStorageServiceFactory(cache, opts),
        await userDecryptionOptionsServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
      ),
  );
}
