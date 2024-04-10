import { objToStore } from "./abstractions/abstract-chrome-storage-api.service";
import BrowserLocalStorageService from "./browser-local-storage.service";

describe("BrowserLocalStorageService", () => {
  let service: BrowserLocalStorageService;
  let store: Record<any, any>;

  beforeEach(() => {
    store = {};

    service = new BrowserLocalStorageService();
  });

  describe("clear", () => {
    let clearMock: jest.Mock;

    beforeEach(() => {
      clearMock = chrome.storage.local.clear as jest.Mock;
    });

    it("uses the api to clear", async () => {
      await service.clear();

      expect(clearMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAll", () => {
    let getMock: jest.Mock;

    beforeEach(() => {
      // setup get
      getMock = chrome.storage.local.get as jest.Mock;
      getMock.mockImplementation((key, callback) => {
        if (key == null) {
          callback(store);
        } else {
          callback({ [key]: store[key] });
        }
      });
    });

    it("returns all values", async () => {
      store["key1"] = "string";
      store["key2"] = 0;
      const result = await service.getAll();

      expect(result).toEqual(store);
    });

    it("handles empty stores", async () => {
      const result = await service.getAll();

      expect(result).toEqual({});
    });

    it("handles stores with null values", async () => {
      store["key"] = null;

      const result = await service.getAll();
      expect(result).toEqual(store);
    });

    it("handles values processed for storage", async () => {
      const obj = { test: 2 };
      const key = "key";
      store[key] = objToStore(obj);

      const result = await service.getAll();

      expect(result).toEqual({
        [key]: obj,
      });
    });

    // This is a test of backwards compatibility before local storage was serialized.
    it("handles values that were stored without processing for storage", async () => {
      const obj = { test: 2 };
      const key = "key";
      store[key] = obj;

      const result = await service.getAll();

      expect(result).toEqual({
        [key]: obj,
      });
    });
  });
});
