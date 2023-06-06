import { SymmetricCryptoKey } from "../../../platform/models/domain/symmetric-crypto-key";

export class EncryptedObject {
  iv: ArrayBuffer;
  data: ArrayBuffer;
  mac: ArrayBuffer;
  key: SymmetricCryptoKey;
}
