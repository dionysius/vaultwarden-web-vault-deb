import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, EventEmitter, Inject, Output, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";

import { SelectPaymentMethodComponent } from "@bitwarden/angular/billing/components";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions";
import { TokenizedPaymentMethodRequest } from "@bitwarden/common/billing/models/request/tokenized-payment-method.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

type ProviderSelectPaymentMethodDialogParams = {
  providerId: string;
};

export enum ProviderSelectPaymentMethodDialogResultType {
  Closed = "closed",
  Submitted = "submitted",
}

export const openProviderSelectPaymentMethodDialog = (
  dialogService: DialogService,
  dialogConfig: DialogConfig<ProviderSelectPaymentMethodDialogParams>,
) =>
  dialogService.open<
    ProviderSelectPaymentMethodDialogResultType,
    ProviderSelectPaymentMethodDialogParams
  >(ProviderSelectPaymentMethodDialogComponent, dialogConfig);

@Component({
  templateUrl: "provider-select-payment-method-dialog.component.html",
})
export class ProviderSelectPaymentMethodDialogComponent {
  @ViewChild(SelectPaymentMethodComponent)
  selectPaymentMethodComponent: SelectPaymentMethodComponent;
  @Output() providerPaymentMethodUpdated = new EventEmitter();

  protected readonly formGroup = new FormGroup({});
  protected readonly ResultType = ProviderSelectPaymentMethodDialogResultType;

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    @Inject(DIALOG_DATA) private dialogParams: ProviderSelectPaymentMethodDialogParams,
    private dialogRef: DialogRef<ProviderSelectPaymentMethodDialogResultType>,
    private i18nService: I18nService,
    private toastService: ToastService,
  ) {}

  submit = async () => {
    const tokenizedPaymentMethod = await this.selectPaymentMethodComponent.tokenizePaymentMethod();
    const request = TokenizedPaymentMethodRequest.From(tokenizedPaymentMethod);
    await this.billingApiService.updateProviderPaymentMethod(this.dialogParams.providerId, request);
    this.providerPaymentMethodUpdated.emit();
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("updatedPaymentMethod"),
    });
    this.dialogRef.close(this.ResultType.Submitted);
  };
}
