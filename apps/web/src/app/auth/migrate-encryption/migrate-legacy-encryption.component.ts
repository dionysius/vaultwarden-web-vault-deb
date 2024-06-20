import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { SharedModule } from "../../shared";
import { UserKeyRotationModule } from "../key-rotation/user-key-rotation.module";
import { UserKeyRotationService } from "../key-rotation/user-key-rotation.service";

// The master key was originally used to encrypt user data, before the user key was introduced.
// This component is used to migrate from the old encryption scheme to the new one.
@Component({
  standalone: true,
  imports: [SharedModule, UserKeyRotationModule],
  templateUrl: "migrate-legacy-encryption.component.html",
})
export class MigrateFromLegacyEncryptionComponent {
  protected formGroup = new FormGroup({
    masterPassword: new FormControl("", [Validators.required]),
  });

  constructor(
    private accountService: AccountService,
    private keyRotationService: UserKeyRotationService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private messagingService: MessagingService,
    private logService: LogService,
    private syncService: SyncService,
  ) {}

  submit = async () => {
    this.formGroup.markAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const activeUser = await firstValueFrom(this.accountService.activeAccount$);

    const hasUserKey = await this.cryptoService.hasUserKey(activeUser.id);
    if (hasUserKey) {
      this.messagingService.send("logout");
      throw new Error("User key already exists, cannot migrate legacy encryption.");
    }

    const masterPassword = this.formGroup.value.masterPassword;

    try {
      await this.syncService.fullSync(false, true);

      await this.keyRotationService.rotateUserKeyAndEncryptedData(masterPassword, activeUser);

      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("keyUpdated"),
        this.i18nService.t("logBackInOthersToo"),
        { timeout: 15000 },
      );
      this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  };
}
