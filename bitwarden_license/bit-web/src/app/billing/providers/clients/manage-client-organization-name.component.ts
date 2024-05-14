import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { UpdateClientOrganizationRequest } from "@bitwarden/common/billing/models/request/update-client-organization.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

type ManageClientOrganizationNameParams = {
  providerId: string;
  organization: {
    id: string;
    name: string;
    seats: number;
  };
};

export enum ManageClientOrganizationNameResultType {
  Closed = "closed",
  Submitted = "submitted",
}

export const openManageClientOrganizationNameDialog = (
  dialogService: DialogService,
  dialogConfig: DialogConfig<ManageClientOrganizationNameParams>,
) =>
  dialogService.open<ManageClientOrganizationNameResultType, ManageClientOrganizationNameParams>(
    ManageClientOrganizationNameComponent,
    dialogConfig,
  );

@Component({
  selector: "app-manage-client-organization-name",
  templateUrl: "manage-client-organization-name.component.html",
})
export class ManageClientOrganizationNameComponent {
  protected ResultType = ManageClientOrganizationNameResultType;
  protected formGroup = this.formBuilder.group({
    name: [this.dialogParams.organization.name, Validators.required],
  });

  constructor(
    @Inject(DIALOG_DATA) protected dialogParams: ManageClientOrganizationNameParams,
    private billingApiService: BillingApiServiceAbstraction,
    private dialogRef: DialogRef<ManageClientOrganizationNameResultType>,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private toastService: ToastService,
  ) {}

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const request = new UpdateClientOrganizationRequest();
    request.assignedSeats = this.dialogParams.organization.seats;
    request.name = this.formGroup.value.name;

    await this.billingApiService.updateClientOrganization(
      this.dialogParams.providerId,
      this.dialogParams.organization.id,
      request,
    );

    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("updatedOrganizationName"),
    });

    this.dialogRef.close(this.ResultType.Submitted);
  };
}
