import { KeySuffixOptions } from "@bitwarden/common/enums";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { CryptoService } from "@bitwarden/common/platform/services/crypto.service";
import { CsprngString } from "@bitwarden/common/types/csprng";

import { ElectronStateService } from "./electron-state.service.abstraction";

export class ElectronCryptoService extends CryptoService {
  constructor(
    cryptoFunctionService: CryptoFunctionService,
    encryptService: EncryptService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    protected override stateService: ElectronStateService
  ) {
    super(cryptoFunctionService, encryptService, platformUtilsService, logService, stateService);
  }

  protected override async storeKey(key: SymmetricCryptoKey, userId?: string) {
    await super.storeKey(key, userId);

    const storeBiometricKey = await this.shouldStoreKey(KeySuffixOptions.Biometric, userId);

    if (storeBiometricKey) {
      await this.storeBiometricKey(key, userId);
    } else {
      await this.stateService.setCryptoMasterKeyBiometric(null, { userId: userId });
    }
  }

  protected async storeBiometricKey(key: SymmetricCryptoKey, userId?: string): Promise<void> {
    let clientEncKeyHalf: CsprngString = null;
    if (await this.stateService.getBiometricRequirePasswordOnStart({ userId })) {
      clientEncKeyHalf = await this.getBiometricEncryptionClientKeyHalf(userId);
    }
    await this.stateService.setCryptoMasterKeyBiometric(
      { key: key.keyB64, clientEncKeyHalf },
      { userId: userId }
    );
  }

  private async getBiometricEncryptionClientKeyHalf(userId?: string): Promise<CsprngString | null> {
    try {
      let biometricKey = await this.stateService
        .getBiometricEncryptionClientKeyHalf({ userId })
        .then((result) => result?.decrypt(null /* user encrypted */))
        .then((result) => result as CsprngString);
      const userKey = await this.getKeyForUserEncryption();
      if (biometricKey == null && userKey != null) {
        const keyBytes = await this.cryptoFunctionService.randomBytes(32);
        biometricKey = Utils.fromBufferToUtf8(keyBytes) as CsprngString;
        const encKey = await this.encryptService.encrypt(biometricKey, userKey);
        await this.stateService.setBiometricEncryptionClientKeyHalf(encKey);
      }

      return biometricKey;
    } catch {
      return null;
    }
  }
}
