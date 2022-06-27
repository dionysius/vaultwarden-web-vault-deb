import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";

export abstract class AbstractEncryptService {
  abstract encrypt(plainValue: string | ArrayBuffer, key: SymmetricCryptoKey): Promise<EncString>;
  abstract decryptToUtf8(encString: EncString, key: SymmetricCryptoKey): Promise<string>;
}
