import { SyncedItemMetadata } from "./sync-item-metadata";

describe("builder", () => {
  const propertyKey = "propertyKey";
  const key = "key";
  const initializer = (s: any) => "used initializer";
  class TestClass {}
  const ctor = TestClass;

  it("should use initializer if provided", () => {
    const metadata: SyncedItemMetadata = {
      propertyKey,
      sessionKey: key,
      initializer,
      initializeAs: "object",
    };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder({})).toBe("used initializer");
  });

  it("should use ctor if initializer is not provided", () => {
    const metadata: SyncedItemMetadata = {
      propertyKey,
      sessionKey: key,
      ctor,
      initializeAs: "object",
    };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder({})).toBeInstanceOf(TestClass);
  });

  it("should prefer initializer over ctor", () => {
    const metadata: SyncedItemMetadata = {
      propertyKey,
      sessionKey: key,
      ctor,
      initializer,
      initializeAs: "object",
    };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder({})).toBe("used initializer");
  });

  it("should honor initialize as array", () => {
    const metadata: SyncedItemMetadata = {
      propertyKey,
      sessionKey: key,
      initializer: initializer,
      initializeAs: "array",
    };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder([{}])).toBeInstanceOf(Array);
    expect(builder([{}])[0]).toBe("used initializer");
  });

  it("should honor initialize as record", () => {
    const metadata: SyncedItemMetadata = {
      propertyKey,
      sessionKey: key,
      initializer: initializer,
      initializeAs: "record",
    };
    const builder = SyncedItemMetadata.builder(metadata);
    expect(builder({ key: "" })).toBeInstanceOf(Object);
    expect(builder({ key: "" })).toStrictEqual({ key: "used initializer" });
  });
});
