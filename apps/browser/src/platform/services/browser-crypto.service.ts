import { firstValueFrom } from "rxjs";

import { KeySuffixOptions } from "@bitwarden/common/platform/enums";
import { CryptoService } from "@bitwarden/common/platform/services/crypto.service";
import { USER_KEY } from "@bitwarden/common/platform/services/key-state/user-key.state";
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

      const userKey = await firstValueFrom(this.stateProvider.getUserState$(USER_KEY, userId));
      if (userKey) {
        return userKey;
      }
    }

    return await super.getKeyFromStorage(keySuffix, userId);
  }
}
