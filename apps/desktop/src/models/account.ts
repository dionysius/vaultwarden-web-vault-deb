import {
  Account as BaseAccount,
  AccountSettings as BaseAccountSettings,
} from "@bitwarden/common/platform/models/domain/account";

export class AccountSettings extends BaseAccountSettings {
  vaultTimeout = -1; // On Restart
  dismissedBiometricRequirePasswordOnStartCallout?: boolean;
}

export class Account extends BaseAccount {
  settings?: AccountSettings = new AccountSettings();

  constructor(init: Partial<Account>) {
    super(init);
    Object.assign(this.settings, {
      ...new AccountSettings(),
      ...this.settings,
    });
  }
}
