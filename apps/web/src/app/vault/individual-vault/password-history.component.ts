import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { OnInit, Inject, Component } from "@angular/core";
import { firstValueFrom, map } from "rxjs";

import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherId, UserId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordHistoryView } from "@bitwarden/common/vault/models/view/password-history.view";
import {
  AsyncActionsModule,
  DialogModule,
  DialogService,
  ToastService,
  ItemModule,
} from "@bitwarden/components";

import { SharedModule } from "../../shared/shared.module";

/**
 * The parameters for the password history dialog.
 */
export interface ViewPasswordHistoryDialogParams {
  cipherId: CipherId;
}

/**
 * A dialog component that displays the password history for a cipher.
 */
@Component({
  selector: "app-vault-password-history",
  templateUrl: "password-history.component.html",
  standalone: true,
  imports: [CommonModule, AsyncActionsModule, DialogModule, ItemModule, SharedModule],
})
export class PasswordHistoryComponent implements OnInit {
  /**
   * The ID of the cipher to display the password history for.
   */
  cipherId: CipherId;

  /**
   * The password history for the cipher.
   */
  history: PasswordHistoryView[] = [];

  /**
   * The constructor for the password history dialog component.
   * @param params The parameters passed to the password history dialog.
   * @param cipherService The cipher service - used to get the cipher to display the password history for.
   * @param platformUtilsService The platform utils service - used to copy passwords to the clipboard.
   * @param i18nService The i18n service - used to translate strings.
   * @param accountService The account service - used to get the active account to decrypt the cipher.
   * @param win The window object - used to copy passwords to the clipboard.
   * @param toastService The toast service - used to display feedback to the user when a password is copied.
   * @param dialogRef The dialog reference - used to close the dialog.
   **/
  constructor(
    @Inject(DIALOG_DATA) public params: ViewPasswordHistoryDialogParams,
    protected cipherService: CipherService,
    protected platformUtilsService: PlatformUtilsService,
    protected i18nService: I18nService,
    protected accountService: AccountService,
    @Inject(WINDOW) private win: Window,
    protected toastService: ToastService,
    private dialogRef: DialogRef<PasswordHistoryComponent>,
  ) {
    /**
     * Set the cipher ID from the parameters.
     */
    this.cipherId = params.cipherId;
  }

  async ngOnInit() {
    await this.init();
  }

  /**
   * Copies a password to the clipboard.
   * @param password The password to copy.
   */
  copy(password: string) {
    const copyOptions = this.win != null ? { window: this.win } : undefined;
    this.platformUtilsService.copyToClipboard(password, copyOptions);
    this.toastService.showToast({
      variant: "info",
      title: "",
      message: this.i18nService.t("valueCopied", this.i18nService.t("password")),
    });
  }

  /**
   * Initializes the password history dialog component.
   */
  protected async init() {
    const cipher = await this.cipherService.get(this.cipherId);
    const activeAccount = await firstValueFrom(
      this.accountService.activeAccount$.pipe(map((a: { id: string | undefined }) => a)),
    );

    if (!activeAccount || !activeAccount.id) {
      throw new Error("Active account is not available.");
    }

    const activeUserId = activeAccount.id as UserId;
    const decCipher = await cipher.decrypt(
      await this.cipherService.getKeyForCipherKeyDecryption(cipher, activeUserId),
    );
    this.history = decCipher.passwordHistory == null ? [] : decCipher.passwordHistory;
  }

  /**
   * Closes the password history dialog.
   */
  close() {
    this.dialogRef.close();
  }
}

/**
 * Strongly typed wrapper around the dialog service to open the password history dialog.
 */
export function openPasswordHistoryDialog(
  dialogService: DialogService,
  config: DialogConfig<ViewPasswordHistoryDialogParams>,
) {
  return dialogService.open(PasswordHistoryComponent, config);
}
