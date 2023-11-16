import { Opaque } from "type-fest";

import { KeyDefinition } from "./key-definition";
import { StateDefinition } from "./state-definition";

const fakeStateDefinition = new StateDefinition("fake", "disk");

type FancyString = Opaque<string, "FancyString">;

describe("KeyDefinition", () => {
  describe("constructor", () => {
    it("throws on undefined deserializer", () => {
      expect(() => {
        new KeyDefinition<boolean>(fakeStateDefinition, "fake", {
          deserializer: undefined,
        });
      });
    });
  });

  describe("record", () => {
    it("runs custom deserializer for each record value", () => {
      const recordDefinition = KeyDefinition.record<boolean>(fakeStateDefinition, "fake", {
        // Intentionally negate the value for testing
        deserializer: (value) => !value,
      });

      expect(recordDefinition).toBeTruthy();
      expect(recordDefinition.deserializer).toBeTruthy();

      const deserializedValue = recordDefinition.deserializer({
        test1: false,
        test2: true,
      });

      expect(Object.keys(deserializedValue)).toHaveLength(2);

      // Values should have swapped from their initial value
      expect(deserializedValue["test1"]).toBeTruthy();
      expect(deserializedValue["test2"]).toBeFalsy();
    });

    it("can handle fancy string type", () => {
      // This test is more of a test that I got the typescript typing correctly than actually testing any business logic
      const recordDefinition = KeyDefinition.record<boolean, FancyString>(
        fakeStateDefinition,
        "fake",
        {
          deserializer: (value) => !value,
        }
      );

      const fancyRecord = recordDefinition.deserializer(
        JSON.parse(`{ "myKey": false, "mySecondKey": true }`)
      );

      expect(fancyRecord).toBeTruthy();
      expect(Object.keys(fancyRecord)).toHaveLength(2);
      expect(fancyRecord["myKey" as FancyString]).toBeTruthy();
      expect(fancyRecord["mySecondKey" as FancyString]).toBeFalsy();
    });
  });

  describe("array", () => {
    it("run custom deserializer for each array element", () => {
      const arrayDefinition = KeyDefinition.array<boolean>(fakeStateDefinition, "fake", {
        deserializer: (value) => !value,
      });

      expect(arrayDefinition).toBeTruthy();
      expect(arrayDefinition.deserializer).toBeTruthy();

      const deserializedValue = arrayDefinition.deserializer([false, true]);

      expect(deserializedValue).toBeTruthy();
      expect(deserializedValue).toHaveLength(2);
      expect(deserializedValue[0]).toBeTruthy();
      expect(deserializedValue[1]).toBeFalsy();
    });
  });
});
