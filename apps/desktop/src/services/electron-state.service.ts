import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { StorageOptions } from "@bitwarden/common/models/domain/storage-options";
import { StateService as BaseStateService } from "@bitwarden/common/services/state.service";

import { Account } from "../models/account";

import { ElectronStateService as ElectronStateServiceAbstraction } from "./electron-state.service.abstraction";

export class ElectronStateService
  extends BaseStateService<GlobalState, Account>
  implements ElectronStateServiceAbstraction
{
  async addAccount(account: Account) {
    // Apply desktop overides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }

  async getBiometricEncryptionClientKeyHalf(options?: StorageOptions): Promise<EncString> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
    const key = account?.keys?.biometricEncryptionClientKeyHalf;
    return key == null ? null : new EncString(key);
  }

  async setBiometricEncryptionClientKeyHalf(
    value: EncString,
    options?: StorageOptions
  ): Promise<void> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
    account.keys.biometricEncryptionClientKeyHalf = value?.encryptedString;
    await this.saveAccount(
      account,
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
  }

  async getBiometricRequirePasswordOnStart(options?: StorageOptions): Promise<boolean> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
    return account?.settings?.requirePasswordOnStart;
  }

  async setBiometricRequirePasswordOnStart(
    value: boolean,
    options?: StorageOptions
  ): Promise<void> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
    account.settings.requirePasswordOnStart = value;
    await this.saveAccount(
      account,
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
  }

  async getDismissedBiometricRequirePasswordOnStart(options?: StorageOptions): Promise<boolean> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
    return account?.settings?.dismissedBiometricRequirePasswordOnStartCallout;
  }

  async setDismissedBiometricRequirePasswordOnStart(options?: StorageOptions): Promise<void> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
    account.settings.dismissedBiometricRequirePasswordOnStartCallout = true;
    await this.saveAccount(
      account,
      this.reconcileOptions(options, await this.defaultOnDiskOptions())
    );
  }
}
