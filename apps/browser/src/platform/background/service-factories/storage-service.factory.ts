import {
  AbstractMemoryStorageService,
  AbstractStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { MemoryStorageService } from "@bitwarden/common/platform/services/memory-storage.service";

import { BrowserApi } from "../../browser/browser-api";
import BrowserLocalStorageService from "../../services/browser-local-storage.service";
import { LocalBackedSessionStorageService } from "../../services/local-backed-session-storage.service";

import { EncryptServiceInitOptions, encryptServiceFactory } from "./encrypt-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  KeyGenerationServiceInitOptions,
  keyGenerationServiceFactory,
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
  cache: { memoryStorageService?: AbstractMemoryStorageService } & CachedServices,
  opts: MemoryStorageServiceInitOptions
): Promise<AbstractMemoryStorageService> {
  return factory(cache, "memoryStorageService", opts, async () => {
    if (BrowserApi.manifestVersion === 3) {
      return new LocalBackedSessionStorageService(
        await encryptServiceFactory(cache, opts),
        await keyGenerationServiceFactory(cache, opts)
      );
    }
    return new MemoryStorageService();
  });
}
