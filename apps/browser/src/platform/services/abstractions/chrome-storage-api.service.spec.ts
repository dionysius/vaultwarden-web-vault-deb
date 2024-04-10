import AbstractChromeStorageService, {
  objToStore,
  serializationIndicator,
} from "./abstract-chrome-storage-api.service";

class TestChromeStorageApiService extends AbstractChromeStorageService {}

describe("objectToStore", () => {
  it("converts an object to a tagged string", () => {
    const obj = { key: "value" };
    const result = objToStore(obj);
    expect(result).toEqual({
      [serializationIndicator]: true,
      value: JSON.stringify(obj),
    });
  });

  it("converts a set to an array prior to serialization", () => {
    const obj = new Set(["value"]);
    const result = objToStore(obj);
    expect(result).toEqual({
      [serializationIndicator]: true,
      value: JSON.stringify(Array.from(obj)),
    });
  });

  it("does nothing to null", () => {
    expect(objToStore(null)).toEqual(null);
  });
});

describe("ChromeStorageApiService", () => {
  let service: TestChromeStorageApiService;
  let store: Record<any, any>;

  beforeEach(() => {
    store = {};

    service = new TestChromeStorageApiService(chrome.storage.local);
  });

  describe("save", () => {
    let setMock: jest.Mock;

    beforeEach(() => {
      // setup save
      setMock = chrome.storage.local.set as jest.Mock;
      setMock.mockImplementation((data, callback) => {
        Object.assign(store, data);
        callback();
      });
    });

    it("uses `objToStore` to prepare a value for set", async () => {
      const key = "key";
      const value = { key: "value" };
      await service.save(key, value);
      expect(setMock).toHaveBeenCalledWith(
        {
          [key]: objToStore(value),
        },
        expect.any(Function),
      );
    });
  });

  describe("get", () => {
    let getMock: jest.Mock;
    const key = "key";

    beforeEach(() => {
      // setup get
      getMock = chrome.storage.local.get as jest.Mock;
      getMock.mockImplementation((key, callback) => {
        callback({ [key]: store[key] });
      });
    });

    it("returns a stored value when it is serialized", async () => {
      const value = { key: "value" };
      store[key] = objToStore(value);
      const result = await service.get(key);
      expect(result).toEqual(value);
    });

    it("returns a stored value when it is not serialized", async () => {
      const value = "value";
      store[key] = value;
      const result = await service.get(key);
      expect(result).toEqual(value);
    });

    it("returns null when the key does not exist", async () => {
      const result = await service.get("key");
      expect(result).toBeNull();
    });

    it("returns null when the stored object is null", async () => {
      store[key] = null;

      const result = await service.get(key);
      expect(result).toBeNull();
    });
  });
});
