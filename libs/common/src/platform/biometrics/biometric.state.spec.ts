import { ENCRYPTED_CLIENT_KEY_HALF, REQUIRE_PASSWORD_ON_START } from "./biometric.state";

describe("require password on start", () => {
  const sut = REQUIRE_PASSWORD_ON_START;

  it("should deserialize require password on start state", () => {
    const requirePasswordOnStart = "requirePasswordOnStart";

    const result = sut.deserializer(JSON.parse(JSON.stringify(requirePasswordOnStart)));

    expect(result).toEqual(requirePasswordOnStart);
  });
});

describe("encrypted client key half", () => {
  const sut = ENCRYPTED_CLIENT_KEY_HALF;

  it("should deserialize encrypted client key half state", () => {
    const encryptedClientKeyHalf = "encryptedClientKeyHalf";

    const result = sut.deserializer(JSON.parse(JSON.stringify(encryptedClientKeyHalf)));

    expect(result).toEqual(encryptedClientKeyHalf);
  });
});
