import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { Lazy } from "@bitwarden/common/platform/misc/lazy";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { MemoryStorageService } from "@bitwarden/common/platform/services/memory-storage.service";

import { BrowserApi } from "../../browser/browser-api";
import BrowserLocalStorageService from "../../services/browser-local-storage.service";
import BrowserMemoryStorageService from "../../services/browser-memory-storage.service";
import { LocalBackedSessionStorageService } from "../../services/local-backed-session-storage.service";
import { BackgroundMemoryStorageService } from "../../storage/background-memory-storage.service";

import { EncryptServiceInitOptions, encryptServiceFactory } from "./encrypt-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  KeyGenerationServiceInitOptions,
  keyGenerationServiceFactory,
} from "./key-generation-service.factory";
import { LogServiceInitOptions, logServiceFactory } from "./log-service.factory";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "./platform-utils-service.factory";

export type DiskStorageServiceInitOptions = FactoryOptions;
export type SecureStorageServiceInitOptions = FactoryOptions;
export type SessionStorageServiceInitOptions = FactoryOptions;
export type MemoryStorageServiceInitOptions = FactoryOptions &
  EncryptServiceInitOptions &
  KeyGenerationServiceInitOptions &
  DiskStorageServiceInitOptions &
  SessionStorageServiceInitOptions &
  LogServiceInitOptions &
  PlatformUtilsServiceInitOptions;

export function diskStorageServiceFactory(
  cache: { diskStorageService?: AbstractStorageService } & CachedServices,
  opts: DiskStorageServiceInitOptions,
): Promise<AbstractStorageService> {
  return factory(cache, "diskStorageService", opts, () => new BrowserLocalStorageService());
}
export function observableDiskStorageServiceFactory(
  cache: {
    diskStorageService?: AbstractStorageService & ObservableStorageService;
  } & CachedServices,
  opts: DiskStorageServiceInitOptions,
): Promise<AbstractStorageService & ObservableStorageService> {
  return factory(cache, "diskStorageService", opts, () => new BrowserLocalStorageService());
}

export function secureStorageServiceFactory(
  cache: { secureStorageService?: AbstractStorageService } & CachedServices,
  opts: SecureStorageServiceInitOptions,
): Promise<AbstractStorageService> {
  return factory(cache, "secureStorageService", opts, () => new BrowserLocalStorageService());
}

export function sessionStorageServiceFactory(
  cache: { sessionStorageService?: AbstractStorageService } & CachedServices,
  opts: SessionStorageServiceInitOptions,
): Promise<AbstractStorageService> {
  return factory(cache, "sessionStorageService", opts, () => new BrowserMemoryStorageService());
}

export function memoryStorageServiceFactory(
  cache: { memoryStorageService?: AbstractMemoryStorageService } & CachedServices,
  opts: MemoryStorageServiceInitOptions,
): Promise<AbstractMemoryStorageService> {
  return factory(cache, "memoryStorageService", opts, async () => {
    if (BrowserApi.isManifestVersion(3)) {
      return new LocalBackedSessionStorageService(
        new Lazy(async () => {
          const existingKey = await (
            await sessionStorageServiceFactory(cache, opts)
          ).get<SymmetricCryptoKey>("session-key");
          if (existingKey) {
            return existingKey;
          }
          const { derivedKey } = await (
            await keyGenerationServiceFactory(cache, opts)
          ).createKeyWithPurpose(128, "ephemeral", "bitwarden-ephemeral");
          await (await sessionStorageServiceFactory(cache, opts)).save("session-key", derivedKey);
          return derivedKey;
        }),
        await diskStorageServiceFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
      );
    }
    return new MemoryStorageService();
  });
}

export function observableMemoryStorageServiceFactory(
  cache: {
    memoryStorageService?: AbstractMemoryStorageService & ObservableStorageService;
  } & CachedServices,
  opts: MemoryStorageServiceInitOptions,
): Promise<AbstractMemoryStorageService & ObservableStorageService> {
  return factory(cache, "memoryStorageService", opts, async () => {
    return new BackgroundMemoryStorageService();
  });
}
