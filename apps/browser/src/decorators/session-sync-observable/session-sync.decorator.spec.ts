import { BehaviorSubject } from "rxjs";

import { sessionSync } from "./session-sync.decorator";

describe("sessionSync decorator", () => {
  const initializer = (s: string) => "test";
  class TestClass {
    @sessionSync({ initializer: initializer })
    private testProperty = new BehaviorSubject("");
    @sessionSync({ initializer: initializer, initializeAs: "array" })
    private secondTestProperty = new BehaviorSubject("");

    complete() {
      this.testProperty.complete();
      this.secondTestProperty.complete();
    }
  }

  it("should add __syncedItemKeys to prototype", () => {
    const testClass = new TestClass();
    expect((testClass as any).__syncedItemMetadata).toEqual([
      expect.objectContaining({
        propertyKey: "testProperty",
        sessionKey: "testProperty_0",
        initializer: initializer,
      }),
      expect.objectContaining({
        propertyKey: "secondTestProperty",
        sessionKey: "secondTestProperty_1",
        initializer: initializer,
        initializeAs: "array",
      }),
    ]);
    testClass.complete();
  });

  class TestClass2 {
    @sessionSync({ initializer: initializer })
    private testProperty = new BehaviorSubject("");

    complete() {
      this.testProperty.complete();
    }
  }

  it("should maintain sessionKey index count for other test classes", () => {
    const testClass = new TestClass2();
    expect((testClass as any).__syncedItemMetadata).toEqual([
      expect.objectContaining({
        propertyKey: "testProperty",
        sessionKey: "testProperty_2",
        initializer: initializer,
      }),
    ]);
    testClass.complete();
  });
});
