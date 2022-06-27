import { StorageOptions } from "../models/domain/storageOptions";

export abstract class AbstractStorageService {
  abstract get<T>(key: string, options?: StorageOptions): Promise<T>;
  abstract has(key: string, options?: StorageOptions): Promise<boolean>;
  abstract save<T>(key: string, obj: T, options?: StorageOptions): Promise<void>;
  abstract remove(key: string, options?: StorageOptions): Promise<void>;
}
