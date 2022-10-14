import { SymmetricCryptoKey } from "./symmetric-crypto-key";

export class EncryptedObject {
  iv: ArrayBuffer;
  data: ArrayBuffer;
  mac: ArrayBuffer;
  key: SymmetricCryptoKey;
}
