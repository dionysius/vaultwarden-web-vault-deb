import AbstractChromeStorageService from "./abstractions/abstract-chrome-storage-api.service";

export default class BrowserLocalStorageService extends AbstractChromeStorageService {
  constructor() {
    super(chrome.storage.local);
  }

  /**
   * Clears local storage
   */
  async clear() {
    await chrome.storage.local.clear();
  }

  /**
   * Retrieves all objects stored in local storage.
   *
   * @remarks This method processes values prior to resolving, do not use `chrome.storage.local` directly
   * @returns Promise resolving to keyed object of all stored data
   */
  async getAll(): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      this.chromeStorageApi.get(null, (allStorage) => {
        const resolved = Object.entries(allStorage).reduce(
          (agg, [key, value]) => {
            agg[key] = this.processGetObject(value);
            return agg;
          },
          {} as Record<string, unknown>,
        );
        resolve(resolved);
      });
    });
  }
}
