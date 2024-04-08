import { mergeMap } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
  StorageUpdateType,
} from "@bitwarden/common/platform/abstractions/storage.service";

import { fromChromeEvent } from "../../browser/from-chrome-event";

export const serializationIndicator = "__json__";

export const objToStore = (obj: any) => {
  if (obj == null) {
    return null;
  }

  if (obj instanceof Set) {
    obj = Array.from(obj);
  }

  return {
    [serializationIndicator]: true,
    value: JSON.stringify(obj),
  };
};

export default abstract class AbstractChromeStorageService
  implements AbstractStorageService, ObservableStorageService
{
  updates$;

  constructor(protected chromeStorageApi: chrome.storage.StorageArea) {
    this.updates$ = fromChromeEvent(this.chromeStorageApi.onChanged).pipe(
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
            updateType: updateType,
          };
        });
      }),
    );
  }

  get valuesRequireDeserialization(): boolean {
    return true;
  }

  async get<T>(key: string): Promise<T> {
    return new Promise((resolve) => {
      this.chromeStorageApi.get(key, (obj: any) => {
        if (obj != null && obj[key] != null) {
          let value = obj[key];
          if (value[serializationIndicator] && typeof value.value === "string") {
            value = JSON.parse(value.value);
          }
          resolve(value as T);
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
    obj = objToStore(obj);

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
