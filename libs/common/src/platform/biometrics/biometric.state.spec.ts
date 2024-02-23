import { EncryptedString } from "../models/domain/enc-string";
import { KeyDefinition } from "../state";

import {
  DISMISSED_REQUIRE_PASSWORD_ON_START_CALLOUT,
  ENCRYPTED_CLIENT_KEY_HALF,
  PROMPT_AUTOMATICALLY,
  PROMPT_CANCELLED,
  REQUIRE_PASSWORD_ON_START,
} from "./biometric.state";

describe.each([
  [ENCRYPTED_CLIENT_KEY_HALF, "encryptedClientKeyHalf"],
  [DISMISSED_REQUIRE_PASSWORD_ON_START_CALLOUT, true],
  [PROMPT_CANCELLED, true],
  [PROMPT_AUTOMATICALLY, true],
  [REQUIRE_PASSWORD_ON_START, true],
])(
  "deserializes state %s",
  (
    ...args: [KeyDefinition<EncryptedString>, EncryptedString] | [KeyDefinition<boolean>, boolean]
  ) => {
    it("should deserialize state", () => {
      const [keyDefinition, state] = args;
      // Need to type check to avoid TS error due to array values being unions instead of guaranteed tuple pairs
      if (typeof state === "boolean") {
        const deserialized = keyDefinition.deserializer(JSON.parse(JSON.stringify(state)));
        expect(deserialized).toEqual(state);
        return;
      } else {
        const deserialized = keyDefinition.deserializer(JSON.parse(JSON.stringify(state)));
        expect(deserialized).toEqual(state);
      }
    });
  },
);
