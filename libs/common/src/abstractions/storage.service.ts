import { MemoryStorageOptions, StorageOptions } from "../models/domain/storage-options";

export abstract class AbstractStorageService {
  abstract get<T>(key: string, options?: StorageOptions): Promise<T>;
  abstract has(key: string, options?: StorageOptions): Promise<boolean>;
  abstract save<T>(key: string, obj: T, options?: StorageOptions): Promise<void>;
  abstract remove(key: string, options?: StorageOptions): Promise<void>;
}

export abstract class AbstractMemoryStorageService extends AbstractStorageService {
  // Used to identify the service in the session sync decorator framework
  static readonly TYPE = "MemoryStorageService";
  readonly type = AbstractMemoryStorageService.TYPE;

  abstract get<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T>;
  abstract getBypassCache<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T>;
}
