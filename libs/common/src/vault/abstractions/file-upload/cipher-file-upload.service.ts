import { EncArrayBuffer } from "../../../models/domain/enc-array-buffer";
import { EncString } from "../../../models/domain/enc-string";
import { SymmetricCryptoKey } from "../../../models/domain/symmetric-crypto-key";
import { Cipher } from "../../models/domain/cipher";
import { CipherResponse } from "../../models/response/cipher.response";

export abstract class CipherFileUploadService {
  upload: (
    cipher: Cipher,
    encFileName: EncString,
    encData: EncArrayBuffer,
    admin: boolean,
    dataEncKey: [SymmetricCryptoKey, EncString]
  ) => Promise<CipherResponse>;
}
