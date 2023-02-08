import { DialogConfig, DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { DialogService } from "@bitwarden/components";

export interface BulkRestoreDialogParams {
  cipherIds: string[];
}

export enum BulkRestoreDialogResult {
  Restored = "restored",
  Canceled = "canceled",
}

/**
 * Strongly typed helper to open a BulkRestoreDialog
 * @param dialogService Instance of the dialog service that will be used to open the dialog
 * @param config Configuration for the dialog
 */
export const openBulkRestoreDialog = (
  dialogService: DialogService,
  config: DialogConfig<BulkRestoreDialogParams>
) => {
  return dialogService.open<BulkRestoreDialogResult, BulkRestoreDialogParams>(
    BulkRestoreDialogComponent,
    config
  );
};

@Component({
  selector: "vault-bulk-restore-dialog",
  templateUrl: "bulk-restore-dialog.component.html",
})
export class BulkRestoreDialogComponent {
  cipherIds: string[];

  constructor(
    @Inject(DIALOG_DATA) params: BulkRestoreDialogParams,
    private dialogRef: DialogRef<BulkRestoreDialogResult>,
    private cipherService: CipherService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {
    this.cipherIds = params.cipherIds ?? [];
  }

  submit = async () => {
    await this.cipherService.restoreManyWithServer(this.cipherIds);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("restoredItems"));
    this.close(BulkRestoreDialogResult.Restored);
  };

  protected cancel() {
    this.close(BulkRestoreDialogResult.Canceled);
  }

  private close(result: BulkRestoreDialogResult) {
    this.dialogRef.close(result);
  }
}
