import { AccountSettings } from "./account";

describe("AccountSettings", () => {
  describe("fromJSON", () => {
    it("should deserialize to an instance of itself", () => {
      expect(AccountSettings.fromJSON(JSON.parse("{}"))).toBeInstanceOf(AccountSettings);
    });
  });
});
