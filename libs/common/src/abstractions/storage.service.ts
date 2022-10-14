import { MemoryStorageOptions, StorageOptions } from "../models/domain/storage-options";

export abstract class AbstractStorageService {
  abstract get<T>(key: string, options?: StorageOptions): Promise<T>;
  abstract has(key: string, options?: StorageOptions): Promise<boolean>;
  abstract save<T>(key: string, obj: T, options?: StorageOptions): Promise<void>;
  abstract remove(key: string, options?: StorageOptions): Promise<void>;
}

export abstract class AbstractCachedStorageService extends AbstractStorageService {
  abstract getBypassCache<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T>;
}

export interface MemoryStorageServiceInterface {
  get<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T>;
}
