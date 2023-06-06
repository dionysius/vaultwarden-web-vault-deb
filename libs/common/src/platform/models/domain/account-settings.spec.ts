import { AccountSettings, EncryptionPair } from "./account";
import { EncString } from "./enc-string";

describe("AccountSettings", () => {
  describe("fromJSON", () => {
    it("should deserialize to an instance of itself", () => {
      expect(AccountSettings.fromJSON(JSON.parse("{}"))).toBeInstanceOf(AccountSettings);
    });

    it("should deserialize pinProtected", () => {
      const accountSettings = new AccountSettings();
      accountSettings.pinProtected = EncryptionPair.fromJSON<string, EncString>({
        encrypted: "encrypted",
        decrypted: "3.data",
      });
      const jsonObj = JSON.parse(JSON.stringify(accountSettings));
      const actual = AccountSettings.fromJSON(jsonObj);

      expect(actual.pinProtected).toBeInstanceOf(EncryptionPair);
      expect(actual.pinProtected.encrypted).toEqual("encrypted");
      expect(actual.pinProtected.decrypted.encryptedString).toEqual("3.data");
    });
  });
});
