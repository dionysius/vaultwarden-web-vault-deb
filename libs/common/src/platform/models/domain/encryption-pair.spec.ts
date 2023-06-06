import { Utils } from "../../misc/utils";

import { EncryptionPair } from "./account";

describe("EncryptionPair", () => {
  describe("toJSON", () => {
    it("should populate decryptedSerialized for buffer arrays", () => {
      const pair = new EncryptionPair<string, ArrayBuffer>();
      pair.decrypted = Utils.fromByteStringToArray("hello").buffer;
      const json = pair.toJSON();
      expect(json.decrypted).toEqual("hello");
    });

    it("should serialize encrypted and decrypted", () => {
      const pair = new EncryptionPair<string, string>();
      pair.encrypted = "hello";
      pair.decrypted = "world";
      const json = pair.toJSON();
      expect(json.encrypted).toEqual("hello");
      expect(json.decrypted).toEqual("world");
    });
  });

  describe("fromJSON", () => {
    it("should deserialize encrypted and decrypted", () => {
      const pair = EncryptionPair.fromJSON({
        encrypted: "hello",
        decrypted: "world",
      });
      expect(pair.encrypted).toEqual("hello");
      expect(pair.decrypted).toEqual("world");
    });
  });
});
