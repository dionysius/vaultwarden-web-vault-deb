import { SyncedItemMetadata } from "./sync-item-metadata";

describe("builder", () => {
  const propertyKey = "propertyKey";
  const key = "key";
  const initializer = (s: any) => "used initializer";
  class TestClass {}
  const ctor = TestClass;

  it("should use initializer if provided", () => {
    const metadata = { propertyKey, sessionKey: key, initializer };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder({})).toBe("used initializer");
  });

  it("should use ctor if initializer is not provided", () => {
    const metadata = { propertyKey, sessionKey: key, ctor };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder({})).toBeInstanceOf(TestClass);
  });

  it("should prefer initializer over ctor", () => {
    const metadata = { propertyKey, sessionKey: key, ctor, initializer };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder({})).toBe("used initializer");
  });

  it("should honor initialize as array", () => {
    const metadata = {
      propertyKey,
      sessionKey: key,
      initializer: initializer,
      initializeAsArray: true,
    };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder([{}])).toBeInstanceOf(Array);
    expect(builder([{}])[0]).toBe("used initializer");
  });
});
