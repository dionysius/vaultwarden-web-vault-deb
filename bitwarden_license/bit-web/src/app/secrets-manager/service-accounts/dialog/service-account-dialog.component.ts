import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { ServiceAccountView } from "../../models/view/service-account.view";
import { ServiceAccountService } from "../service-account.service";

export interface ServiceAccountOperation {
  organizationId: string;
}

@Component({
  selector: "sm-service-account-dialog",
  templateUrl: "./service-account-dialog.component.html",
})
export class ServiceAccountDialogComponent {
  protected formGroup = new FormGroup({
    name: new FormControl("", [Validators.required]),
  });

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) private data: ServiceAccountOperation,
    private serviceAccountService: ServiceAccountService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const serviceAccountView = this.getServiceAccountView();
    await this.serviceAccountService.create(this.data.organizationId, serviceAccountView);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("serviceAccountCreated")
    );
    this.dialogRef.close();
  };

  private getServiceAccountView() {
    const serviceAccountView = new ServiceAccountView();
    serviceAccountView.organizationId = this.data.organizationId;
    serviceAccountView.name = this.formGroup.value.name;
    return serviceAccountView;
  }
}
