import { EncryptionType } from "../enums/encryptionType";

export interface IEncrypted {
  encryptionType?: EncryptionType;
  dataBytes: ArrayBuffer;
  macBytes: ArrayBuffer;
  ivBytes: ArrayBuffer;
}
