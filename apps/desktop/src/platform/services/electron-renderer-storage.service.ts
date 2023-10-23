import { AbstractStorageService } from "@bitwarden/common/platform/abstractions/storage.service";

export class ElectronRendererStorageService implements AbstractStorageService {
  get<T>(key: string): Promise<T> {
    return ipc.platform.storage.get(key);
  }

  has(key: string): Promise<boolean> {
    return ipc.platform.storage.has(key);
  }

  save(key: string, obj: any): Promise<any> {
    return ipc.platform.storage.save(key, obj);
  }

  remove(key: string): Promise<any> {
    return ipc.platform.storage.remove(key);
  }
}
