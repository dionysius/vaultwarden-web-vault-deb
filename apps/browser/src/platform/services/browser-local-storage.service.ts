import AbstractChromeStorageService from "./abstractions/abstract-chrome-storage-api.service";

export default class BrowserLocalStorageService extends AbstractChromeStorageService {
  constructor() {
    super(chrome.storage.local);
  }

  async fillBuffer() {
    // Write 4MB of data in chrome.storage.local, log files will hold 4MB of data (by default)
    // before forcing a compaction. To force a compaction and have it remove previously saved data,
    // we want to fill it's buffer so that anything newly marked for deletion is gone.
    // https://github.com/google/leveldb/blob/main/doc/impl.md#log-files
    // It's important that if Google uses a different buffer length that we match that, as far as I can tell
    // Google uses the default value in Chromium:
    // https://github.com/chromium/chromium/blob/148774efa6b3a047369af6179a4248566b39d68f/components/value_store/lazy_leveldb.cc#L65-L66
    const fakeData = "0".repeat(1024 * 1024); // 1MB of data
    await new Promise<void>((resolve, reject) => {
      this.chromeStorageApi.set(
        {
          fake_data_1: fakeData,
          fake_data_2: fakeData,
          fake_data_3: fakeData,
          fake_data_4: fakeData,
        },
        () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }

          resolve();
        },
      );
    });
    await new Promise<void>((resolve, reject) => {
      this.chromeStorageApi.remove(
        ["fake_data_1", "fake_data_2", "fake_data_3", "fake_data_4"],
        () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }

          resolve();
        },
      );
    });
  }
}
