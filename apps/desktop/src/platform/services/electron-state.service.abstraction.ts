import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { StorageOptions } from "@bitwarden/common/platform/models/domain/storage-options";

import { Account } from "../../models/account";

export abstract class ElectronStateService extends StateService<Account> {
  getBiometricEncryptionClientKeyHalf: (options?: StorageOptions) => Promise<EncString>;
  setBiometricEncryptionClientKeyHalf: (
    value: EncString,
    options?: StorageOptions,
  ) => Promise<void>;
  getDismissedBiometricRequirePasswordOnStart: (options?: StorageOptions) => Promise<boolean>;
  setDismissedBiometricRequirePasswordOnStart: (options?: StorageOptions) => Promise<void>;
  getBiometricRequirePasswordOnStart: (options?: StorageOptions) => Promise<boolean>;
  setBiometricRequirePasswordOnStart: (value: boolean, options?: StorageOptions) => Promise<void>;
}
