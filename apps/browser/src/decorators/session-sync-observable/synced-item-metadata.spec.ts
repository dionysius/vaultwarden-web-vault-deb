import { SyncedItemMetadata } from "./sync-item-metadata";

describe("builder", () => {
  const propertyKey = "propertyKey";
  const key = "key";
  const initializer = (s: any) => "used initializer";

  it("should use initializer", () => {
    const metadata: SyncedItemMetadata = {
      propertyKey,
      sessionKey: key,
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
