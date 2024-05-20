import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { UserId } from "../../../types/guid";
import { GeneratedPasswordHistory } from "../password/generated-password-history";

/** Strategy that decrypts a password history */
export class LegacyPasswordHistoryDecryptor {
  constructor(
    private userId: UserId,
    private cryptoService: CryptoService,
    private encryptService: EncryptService,
  ) {}

  /** Decrypts a password history. */
  async decrypt(history: GeneratedPasswordHistory[]): Promise<GeneratedPasswordHistory[]> {
    const key = await this.cryptoService.getUserKey(this.userId);

    const promises = (history ?? []).map(async (item) => {
      const encrypted = new EncString(item.password);
      const decrypted = await this.encryptService.decryptToUtf8(encrypted, key);
      return new GeneratedPasswordHistory(decrypted, item.date);
    });

    const decrypted = await Promise.all(promises);

    return decrypted;
  }
}
