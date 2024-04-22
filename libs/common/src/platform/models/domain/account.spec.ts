import { Account, AccountKeys, AccountProfile, AccountSettings, AccountTokens } from "./account";

describe("Account", () => {
  describe("fromJSON", () => {
    it("should deserialize to an instance of itself", () => {
      expect(Account.fromJSON({})).toBeInstanceOf(Account);
    });

    it("should call all the sub-fromJSONs", () => {
      const keysSpy = jest.spyOn(AccountKeys, "fromJSON");
      const profileSpy = jest.spyOn(AccountProfile, "fromJSON");
      const settingsSpy = jest.spyOn(AccountSettings, "fromJSON");
      const tokensSpy = jest.spyOn(AccountTokens, "fromJSON");

      Account.fromJSON({});

      expect(keysSpy).toHaveBeenCalled();
      expect(profileSpy).toHaveBeenCalled();
      expect(settingsSpy).toHaveBeenCalled();
      expect(tokensSpy).toHaveBeenCalled();
    });
  });
});
