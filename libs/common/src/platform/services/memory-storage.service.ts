import { Subject } from "rxjs";

import { AbstractMemoryStorageService, StorageUpdate } from "../abstractions/storage.service";

export class MemoryStorageService extends AbstractMemoryStorageService {
  protected store = new Map<string, unknown>();
  private updatesSubject = new Subject<StorageUpdate>();

  get valuesRequireDeserialization(): boolean {
    return false;
  }
  get updates$() {
    return this.updatesSubject.asObservable();
  }

  get<T>(key: string): Promise<T> {
    if (this.store.has(key)) {
      const obj = this.store.get(key);
      return Promise.resolve(obj as T);
    }
    return Promise.resolve(null);
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) != null;
  }

  save<T>(key: string, obj: T): Promise<void> {
    if (obj == null) {
      return this.remove(key);
    }
    // TODO: Remove once foreground/background contexts are separated in browser
    // Needed to ensure ownership of all memory by the context running the storage service
    obj = structuredClone(obj);
    this.store.set(key, obj);
    this.updatesSubject.next({ key, updateType: "save" });
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    this.store.delete(key);
    this.updatesSubject.next({ key, updateType: "remove" });
    return Promise.resolve();
  }

  getBypassCache<T>(key: string): Promise<T> {
    return this.get<T>(key);
  }
}
