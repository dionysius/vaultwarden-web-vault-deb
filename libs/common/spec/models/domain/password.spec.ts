import { PasswordHistoryData } from "@bitwarden/common/models/data/password-history.data";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { Password } from "@bitwarden/common/models/domain/password";

import { mockEnc, mockFromJson } from "../../utils";

describe("Password", () => {
  let data: PasswordHistoryData;

  beforeEach(() => {
    data = {
      password: "encPassword",
      lastUsedDate: "2022-01-31T12:00:00.000Z",
    };
  });

  it("Convert from empty", () => {
    const data = new PasswordHistoryData();
    const password = new Password(data);

    expect(password).toMatchObject({
      password: null,
    });
  });

  it("Convert", () => {
    const password = new Password(data);

    expect(password).toEqual({
      password: { encryptedString: "encPassword", encryptionType: 0 },
      lastUsedDate: new Date("2022-01-31T12:00:00.000Z"),
    });
  });

  it("toPasswordHistoryData", () => {
    const password = new Password(data);
    expect(password.toPasswordHistoryData()).toEqual(data);
  });

  it("Decrypt", async () => {
    const password = new Password();
    password.password = mockEnc("password");
    password.lastUsedDate = new Date("2022-01-31T12:00:00.000Z");

    const view = await password.decrypt(null);

    expect(view).toEqual({
      password: "password",
      lastUsedDate: new Date("2022-01-31T12:00:00.000Z"),
    });
  });

  describe("fromJSON", () => {
    it("initializes nested objects", () => {
      jest.spyOn(EncString, "fromJSON").mockImplementation(mockFromJson);
      const lastUsedDate = new Date("2022-01-31T12:00:00.000Z");

      const actual = Password.fromJSON({
        password: "myPassword",
        lastUsedDate: lastUsedDate.toISOString(),
      });

      expect(actual).toEqual({
        password: "myPassword_fromJSON",
        lastUsedDate: lastUsedDate,
      });
      expect(actual).toBeInstanceOf(Password);
    });

    it("returns null if object is null", () => {
      expect(Password.fromJSON(null)).toBeNull();
    });
  });
});
