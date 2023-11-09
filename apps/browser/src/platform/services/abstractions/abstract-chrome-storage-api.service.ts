import { Observable, mergeMap } from "rxjs";

import {
  AbstractStorageService,
  StorageUpdate,
  StorageUpdateType,
} from "@bitwarden/common/platform/abstractions/storage.service";

import { fromChromeEvent } from "../../browser/from-chrome-event";

export default abstract class AbstractChromeStorageService implements AbstractStorageService {
  constructor(protected chromeStorageApi: chrome.storage.StorageArea) {}

  get updates$(): Observable<StorageUpdate> {
    return fromChromeEvent(this.chromeStorageApi.onChanged).pipe(
      mergeMap(([changes]) => {
        return Object.entries(changes).map(([key, change]) => {
          // The `newValue` property isn't on the StorageChange object
          // when the change was from a remove. Similarly a check of the `oldValue`
          // could be used to tell if the operation was the first creation of this key
          // but we currently do not differentiate that.
          // Ref: https://developer.chrome.com/docs/extensions/reference/storage/#type-StorageChange
          // Ref: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageChange
          const updateType: StorageUpdateType = "newValue" in change ? "save" : "remove";

          return {
            key: key,
            // For removes this property will not exist but then it will just be
            // undefined which is fine.
            value: change.newValue,
            updateType: updateType,
          };
        });
      })
    );
  }

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
      return this.remove(key);
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
