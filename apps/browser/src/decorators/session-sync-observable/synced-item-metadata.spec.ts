import { SyncedItemMetadata } from "./sync-item-metadata";

describe("build from key value pair", () => {
  const propertyKey = "propertyKey";
  const key = "key";
  const initializer = (s: any) => "used initializer";
  class TestClass {}
  const ctor = TestClass;

  it("should call initializer if provided", () => {
    const actual = SyncedItemMetadata.buildFromKeyValuePair(
      {},
      {
        propertyKey,
        sessionKey: "key",
        initializer: initializer,
      }
    );

    expect(actual).toEqual("used initializer");
  });

  it("should call ctor if provided", () => {
    const expected = { provided: "value" };
    const actual = SyncedItemMetadata.buildFromKeyValuePair(expected, {
      propertyKey,
      sessionKey: key,
      ctor: ctor,
    });

    expect(actual).toBeInstanceOf(ctor);
    expect(actual).toEqual(expect.objectContaining(expected));
  });

  it("should prefer using initializer if both are provided", () => {
    const actual = SyncedItemMetadata.buildFromKeyValuePair(
      {},
      {
        propertyKey,
        sessionKey: key,
        initializer: initializer,
        ctor: ctor,
      }
    );

    expect(actual).toEqual("used initializer");
  });

  it("should honor initialize as array", () => {
    const actual = SyncedItemMetadata.buildFromKeyValuePair([1, 2], {
      propertyKey,
      sessionKey: key,
      initializer: initializer,
      initializeAsArray: true,
    });

    expect(actual).toEqual(["used initializer", "used initializer"]);
  });
});
