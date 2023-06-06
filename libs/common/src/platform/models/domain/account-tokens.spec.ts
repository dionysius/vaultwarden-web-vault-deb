import { AccountTokens } from "./account";

describe("AccountTokens", () => {
  describe("fromJSON", () => {
    it("should deserialize to an instance of itself", () => {
      expect(AccountTokens.fromJSON({})).toBeInstanceOf(AccountTokens);
    });
  });
});
