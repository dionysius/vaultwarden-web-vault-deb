import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";

import BrowserLocalStorageService from "../../services/browserLocalStorage.service";
import { LocalBackedSessionStorageService } from "../../services/localBackedSessionStorage.service";

import { encryptServiceFactory, EncryptServiceInitOptions } from "./encrypt-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  keyGenerationServiceFactory,
  KeyGenerationServiceInitOptions,
} from "./key-generation-service.factory";

type StorageServiceFactoryOptions = FactoryOptions;

export type DiskStorageServiceInitOptions = StorageServiceFactoryOptions;
export type SecureStorageServiceInitOptions = StorageServiceFactoryOptions;
export type MemoryStorageServiceInitOptions = StorageServiceFactoryOptions &
  EncryptServiceInitOptions &
  KeyGenerationServiceInitOptions;

export function diskStorageServiceFactory(
  cache: { diskStorageService?: AbstractStorageService } & CachedServices,
  opts: DiskStorageServiceInitOptions
): Promise<AbstractStorageService> {
  return factory(cache, "diskStorageService", opts, () => new BrowserLocalStorageService());
}

export function secureStorageServiceFactory(
  cache: { secureStorageService?: AbstractStorageService } & CachedServices,
  opts: SecureStorageServiceInitOptions
): Promise<AbstractStorageService> {
  return factory(cache, "secureStorageService", opts, () => new BrowserLocalStorageService());
}

export function memoryStorageServiceFactory(
  cache: { memoryStorageService?: AbstractStorageService } & CachedServices,
  opts: MemoryStorageServiceInitOptions
): Promise<AbstractStorageService> {
  return factory(cache, "memoryStorageService", opts, async () => {
    if (chrome.runtime.getManifest().manifest_version == 3) {
      return new LocalBackedSessionStorageService(
        await encryptServiceFactory(cache, opts),
        await keyGenerationServiceFactory(cache, opts)
      );
    }
    return new MemoryStorageService();
  });
}
