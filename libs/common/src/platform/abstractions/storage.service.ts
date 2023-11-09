import { Observable } from "rxjs";

import { MemoryStorageOptions, StorageOptions } from "../models/domain/storage-options";

export type StorageUpdateType = "save" | "remove";
export type StorageUpdate = {
  key: string;
  value?: unknown;
  updateType: StorageUpdateType;
};

export abstract class AbstractStorageService {
  /**
   * Provides an {@link Observable} that represents a stream of updates that
   * have happened in this storage service or in the storage this service provides
   * an interface to.
   */
  abstract get updates$(): Observable<StorageUpdate>;
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
