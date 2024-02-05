import { ENCRYPTED_CLIENT_KEY_HALF } from "./biometric.state";

describe("encrypted client key half", () => {
  const sut = ENCRYPTED_CLIENT_KEY_HALF;

  it("should deserialize encrypted client key half state", () => {
    const encryptedClientKeyHalf = "encryptedClientKeyHalf";

    const result = sut.deserializer(JSON.parse(JSON.stringify(encryptedClientKeyHalf)));

    expect(result).toEqual(encryptedClientKeyHalf);
  });
});
