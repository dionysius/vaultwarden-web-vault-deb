import { KeySuffixOptions } from "@bitwarden/common/platform/enums";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { CryptoService } from "@bitwarden/common/platform/services/crypto.service";
import { UserId } from "@bitwarden/common/types/guid";
import { UserKey } from "@bitwarden/common/types/key";

export class BrowserCryptoService extends CryptoService {
  override async hasUserKeyStored(keySuffix: KeySuffixOptions, userId?: UserId): Promise<boolean> {
    if (keySuffix === KeySuffixOptions.Biometric) {
      return await this.stateService.getBiometricUnlock({ userId: userId });
    }
    return super.hasUserKeyStored(keySuffix, userId);
  }

  /**
   * Browser doesn't store biometric keys, so we retrieve them from the desktop and return
   * if we successfully saved it into memory as the User Key
   * @returns the `UserKey` if the user passes a biometrics prompt, otherwise return `null`.
   */
  protected override async getKeyFromStorage(
    keySuffix: KeySuffixOptions,
    userId?: UserId,
  ): Promise<UserKey> {
    if (keySuffix === KeySuffixOptions.Biometric) {
      const biometricsResult = await this.platformUtilService.authenticateBiometric();

      if (!biometricsResult) {
        return null;
      }

      const userKey = await this.stateService.getUserKey({ userId: userId });
      if (userKey) {
        return new SymmetricCryptoKey(Utils.fromB64ToArray(userKey.keyB64)) as UserKey;
      }
    }

    return await super.getKeyFromStorage(keySuffix, userId);
  }
}
