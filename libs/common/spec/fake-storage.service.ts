import { MockProxy, mock } from "jest-mock-extended";
import { Subject } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
  StorageUpdate,
} from "../src/platform/abstractions/storage.service";
import { StorageOptions } from "../src/platform/models/domain/storage-options";

export class FakeStorageService implements AbstractStorageService, ObservableStorageService {
  private store: Record<string, unknown>;
  private updatesSubject = new Subject<StorageUpdate>();
  private _valuesRequireDeserialization = false;

  /**
   * Returns a mock of a {@see AbstractStorageService} for asserting the expected
   * amount of calls. It is not recommended to use this to mock implementations as
   * they are not respected.
   */
  mock: MockProxy<AbstractStorageService>;

  constructor(initial?: Record<string, unknown>) {
    this.store = initial ?? {};
    this.mock = mock<AbstractStorageService>();
  }

  /**
   * Updates the internal store for this fake implementation, this bypasses any mock calls
   * or updates to the {@link updates$} observable.
   * @param store
   */
  internalUpdateStore(store: Record<string, unknown>) {
    this.store = store;
  }

  get internalStore() {
    return this.store;
  }

  internalUpdateValuesRequireDeserialization(value: boolean) {
    this._valuesRequireDeserialization = value;
  }

  get valuesRequireDeserialization(): boolean {
    return this._valuesRequireDeserialization;
  }

  get updates$() {
    return this.updatesSubject.asObservable();
  }

  get<T>(key: string, options?: StorageOptions): Promise<T> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.get(key, options);
    const value = this.store[key] as T;
    return Promise.resolve(value);
  }
  has(key: string, options?: StorageOptions): Promise<boolean> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.has(key, options);
    return Promise.resolve(this.store[key] != null);
  }
  save<T>(key: string, obj: T, options?: StorageOptions): Promise<void> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.save(key, obj, options);
    this.store[key] = obj;
    this.updatesSubject.next({ key: key, updateType: "save" });
    return Promise.resolve();
  }
  remove(key: string, options?: StorageOptions): Promise<void> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.remove(key, options);
    delete this.store[key];
    this.updatesSubject.next({ key: key, updateType: "remove" });
    return Promise.resolve();
  }
}
