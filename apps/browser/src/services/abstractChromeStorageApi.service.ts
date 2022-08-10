import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";

export default abstract class AbstractChromeStorageService implements AbstractStorageService {
  protected abstract chromeStorageApi: chrome.storage.StorageArea;

  async get<T>(key: string): Promise<T> {
    return new Promise((resolve) => {
      this.chromeStorageApi.get(key, (obj: any) => {
        if (obj != null && obj[key] != null) {
          resolve(obj[key] as T);
          return;
        }
        resolve(null);
      });
    });
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) != null;
  }

  async save(key: string, obj: any): Promise<void> {
    if (obj == null) {
      // Fix safari not liking null in set
      return new Promise<void>((resolve) => {
        this.chromeStorageApi.remove(key, () => {
          resolve();
        });
      });
    }

    if (obj instanceof Set) {
      obj = Array.from(obj);
    }

    const keyedObj = { [key]: obj };
    return new Promise<void>((resolve) => {
      this.chromeStorageApi.set(keyedObj, () => {
        resolve();
      });
    });
  }

  async remove(key: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.chromeStorageApi.remove(key, () => {
        resolve();
      });
    });
  }
}
