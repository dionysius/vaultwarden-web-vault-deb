import { mergeMap } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
  StorageUpdateType,
} from "@bitwarden/common/platform/abstractions/storage.service";

import { fromChromeEvent } from "../../browser/from-chrome-event";

export const serializationIndicator = "__json__";

type serializedObject = { [serializationIndicator]: true; value: string };

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
          resolve(this.processGetObject(obj[key]));
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

  /** Backwards compatible resolution of retrieved object with new serialized storage */
  protected processGetObject<T>(obj: T | serializedObject): T | null {
    if (this.isSerialized(obj)) {
      obj = JSON.parse(obj.value);
    }
    return obj as T;
  }

  /** Type guard for whether an object is tagged as serialized */
  protected isSerialized<T>(value: T | serializedObject): value is serializedObject {
    const asSerialized = value as serializedObject;
    return (
      asSerialized != null &&
      asSerialized[serializationIndicator] &&
      typeof asSerialized.value === "string"
    );
  }
}
