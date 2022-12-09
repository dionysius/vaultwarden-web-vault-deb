import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { SecretService } from "../secret.service";

export interface SecretDeleteOperation {
  secretIds: string[];
}

@Component({
  selector: "sm-secret-delete-dialog",
  templateUrl: "./secret-delete.component.html",
})
export class SecretDeleteDialogComponent {
  constructor(
    public dialogRef: DialogRef,
    private secretService: SecretService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    @Inject(DIALOG_DATA) public data: SecretDeleteOperation
  ) {}

  get title() {
    return this.data.secretIds.length === 1 ? "deleteSecret" : "deleteSecrets";
  }

  delete = async () => {
    await this.secretService.delete(this.data.secretIds);
    this.dialogRef.close();
    const message =
      this.data.secretIds.length === 1 ? "softDeleteSuccessToast" : "softDeletesSuccessToast";
    this.platformUtilsService.showToast("success", null, this.i18nService.t(message));
  };
}
