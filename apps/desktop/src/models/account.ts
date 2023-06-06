import { Jsonify } from "type-fest";

import {
  Account as BaseAccount,
  AccountSettings as BaseAccountSettings,
  AccountKeys as BaseAccountKeys,
} from "@bitwarden/common/platform/models/domain/account";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

export class AccountSettings extends BaseAccountSettings {
  vaultTimeout = -1; // On Restart
  requirePasswordOnStart?: boolean;
  dismissedBiometricRequirePasswordOnStartCallout?: boolean;
}

export class AccountKeys extends BaseAccountKeys {
  biometricEncryptionClientKeyHalf?: Jsonify<EncString>;
}

export class Account extends BaseAccount {
  settings?: AccountSettings = new AccountSettings();
  keys?: AccountKeys = new AccountKeys();

  constructor(init: Partial<Account>) {
    super(init);
    Object.assign(this.settings, {
      ...new AccountSettings(),
      ...this.settings,
    });
  }
}
