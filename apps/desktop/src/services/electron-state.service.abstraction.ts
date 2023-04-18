import { StateService } from "@bitwarden/common/abstractions/state.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { StorageOptions } from "@bitwarden/common/models/domain/storage-options";

import { Account } from "../models/account";

export abstract class ElectronStateService extends StateService<Account> {
  getBiometricEncryptionClientKeyHalf: (options?: StorageOptions) => Promise<EncString>;
  setBiometricEncryptionClientKeyHalf: (
    value: EncString,
    options?: StorageOptions
  ) => Promise<void>;
  getDismissedBiometricRequirePasswordOnStart: (options?: StorageOptions) => Promise<boolean>;
  setDismissedBiometricRequirePasswordOnStart: (options?: StorageOptions) => Promise<void>;
  getBiometricRequirePasswordOnStart: (options?: StorageOptions) => Promise<boolean>;
  setBiometricRequirePasswordOnStart: (value: boolean, options?: StorageOptions) => Promise<void>;
}
