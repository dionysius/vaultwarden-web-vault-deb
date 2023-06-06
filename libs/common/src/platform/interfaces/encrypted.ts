import { EncryptionType } from "../../enums";

export interface Encrypted {
  encryptionType?: EncryptionType;
  dataBytes: ArrayBuffer;
  macBytes: ArrayBuffer;
  ivBytes: ArrayBuffer;
}
