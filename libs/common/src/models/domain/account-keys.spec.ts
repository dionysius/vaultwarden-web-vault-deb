import { makeStaticByteArray } from "../../../spec/utils";
import { Utils } from "../../misc/utils";

import { AccountKeys, EncryptionPair } from "./account";
import { SymmetricCryptoKey } from "./symmetric-crypto-key";

describe("AccountKeys", () => {
  describe("toJSON", () => {
    it("should serialize itself", () => {
      const keys = new AccountKeys();
      const buffer = makeStaticByteArray(64).buffer;
      keys.publicKey = buffer;

      const bufferSpy = jest.spyOn(Utils, "fromBufferToByteString");
      keys.toJSON();
      expect(bufferSpy).toHaveBeenCalledWith(buffer);
    });

    it("should serialize public key as a string", () => {
      const keys = new AccountKeys();
      keys.publicKey = Utils.fromByteStringToArray("hello").buffer;
      const json = JSON.stringify(keys);
      expect(json).toContain('"publicKey":"hello"');
    });
  });

  describe("fromJSON", () => {
    it("should deserialize public key to a buffer", () => {
      const keys = AccountKeys.fromJSON({
        publicKey: "hello",
      });
      expect(keys.publicKey).toEqual(Utils.fromByteStringToArray("hello").buffer);
    });

    it("should deserialize cryptoMasterKey", () => {
      const spy = jest.spyOn(SymmetricCryptoKey, "fromJSON");
      AccountKeys.fromJSON({} as any);
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize organizationKeys", () => {
      const spy = jest.spyOn(SymmetricCryptoKey, "fromJSON");
      AccountKeys.fromJSON({ organizationKeys: [{ orgId: "keyJSON" }] } as any);
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize providerKeys", () => {
      const spy = jest.spyOn(SymmetricCryptoKey, "fromJSON");
      AccountKeys.fromJSON({ providerKeys: [{ providerId: "keyJSON" }] } as any);
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize privateKey", () => {
      const spy = jest.spyOn(EncryptionPair, "fromJSON");
      AccountKeys.fromJSON({
        privateKey: { encrypted: "encrypted", decrypted: "decrypted" },
      } as any);
      expect(spy).toHaveBeenCalled();
    });
  });
});
