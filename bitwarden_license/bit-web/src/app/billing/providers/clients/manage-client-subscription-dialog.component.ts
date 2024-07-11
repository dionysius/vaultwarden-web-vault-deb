import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

import { ProviderUserType } from "@bitwarden/common/admin-console/enums";
import { Provider } from "@bitwarden/common/admin-console/models/domain/provider";
import { ProviderOrganizationOrganizationDetailsResponse } from "@bitwarden/common/admin-console/models/response/provider/provider-organization.response";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions";
import { UpdateClientOrganizationRequest } from "@bitwarden/common/billing/models/request/update-client-organization.request";
import { ProviderPlanResponse } from "@bitwarden/common/billing/models/response/provider-subscription-response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

type ManageClientSubscriptionDialogParams = {
  organization: ProviderOrganizationOrganizationDetailsResponse;
  provider: Provider;
};

export enum ManageClientSubscriptionDialogResultType {
  Closed = "closed",
  Submitted = "submitted",
}

export const openManageClientSubscriptionDialog = (
  dialogService: DialogService,
  dialogConfig: DialogConfig<ManageClientSubscriptionDialogParams>,
) =>
  dialogService.open<
    ManageClientSubscriptionDialogResultType,
    ManageClientSubscriptionDialogParams
  >(ManageClientSubscriptionDialogComponent, dialogConfig);

@Component({
  templateUrl: "./manage-client-subscription-dialog.component.html",
})
export class ManageClientSubscriptionDialogComponent implements OnInit {
  protected loading = true;
  protected providerPlan: ProviderPlanResponse;
  protected openSeats: number;
  protected readonly ResultType = ManageClientSubscriptionDialogResultType;

  protected formGroup = new FormGroup({
    assignedSeats: new FormControl<number>(this.dialogParams.organization.seats, [
      Validators.required,
      Validators.min(this.dialogParams.organization.occupiedSeats),
    ]),
  });

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    @Inject(DIALOG_DATA) protected dialogParams: ManageClientSubscriptionDialogParams,
    private dialogRef: DialogRef<ManageClientSubscriptionDialogResultType>,
    private i18nService: I18nService,
    private toastService: ToastService,
  ) {}

  async ngOnInit(): Promise<void> {
    const response = await this.billingApiService.getProviderSubscription(
      this.dialogParams.provider.id,
    );

    this.providerPlan = response.plans.find(
      (plan) => plan.planName === this.dialogParams.organization.plan,
    );

    this.openSeats = this.providerPlan.seatMinimum - this.providerPlan.assignedSeats;

    this.formGroup.controls.assignedSeats.addValidators(
      this.isServiceUserWithPurchasedSeats
        ? this.createPurchasedSeatsValidator()
        : this.createUnassignedSeatsValidator(),
    );

    this.loading = false;
  }

  submit = async () => {
    this.loading = true;

    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const request = new UpdateClientOrganizationRequest();
    request.assignedSeats = this.formGroup.value.assignedSeats;
    request.name = this.dialogParams.organization.organizationName;

    await this.billingApiService.updateClientOrganization(
      this.dialogParams.provider.id,
      this.dialogParams.organization.id,
      request,
    );

    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("subscriptionUpdated"),
    });

    this.loading = false;
    this.dialogRef.close(this.ResultType.Submitted);
  };

  createPurchasedSeatsValidator =
    (): ValidatorFn =>
    (formControl: FormControl<number>): ValidationErrors | null => {
      if (this.isProviderAdmin) {
        return null;
      }

      const seatAdjustment = formControl.value - this.dialogParams.organization.seats;

      if (seatAdjustment <= 0) {
        return null;
      }

      return {
        insufficientPermissions: {
          message: this.i18nService.t("contactYourProviderForAdditionalSeats"),
        },
      };
    };

  createUnassignedSeatsValidator =
    (): ValidatorFn =>
    (formControl: FormControl<number>): ValidationErrors | null => {
      if (this.isProviderAdmin) {
        return null;
      }

      const seatAdjustment = formControl.value - this.dialogParams.organization.seats;

      if (seatAdjustment <= this.openSeats) {
        return null;
      }

      const unassignedSeatsAvailableMessage = this.i18nService.t(
        "unassignedSeatsAvailable",
        this.openSeats,
      );

      const contactYourProviderMessage = this.i18nService.t(
        "contactYourProviderForAdditionalSeats",
      );

      return {
        insufficientPermissions: {
          message: `${unassignedSeatsAvailableMessage} ${contactYourProviderMessage}`,
        },
      };
    };

  get unassignedSeats(): number {
    const seatDifference =
      this.formGroup.value.assignedSeats - this.dialogParams.organization.seats;

    const unassignedSeats = this.openSeats - seatDifference;

    return unassignedSeats >= 0 ? unassignedSeats : 0;
  }

  get additionalSeatsPurchased(): number {
    const seatDifference =
      this.formGroup.value.assignedSeats - this.dialogParams.organization.seats;

    const purchasedSeats = seatDifference - this.openSeats;

    return purchasedSeats > 0 ? purchasedSeats : 0;
  }

  get isProviderAdmin(): boolean {
    return this.dialogParams.provider.type === ProviderUserType.ProviderAdmin;
  }

  get isServiceUserWithPurchasedSeats(): boolean {
    return !this.isProviderAdmin && this.providerPlan && this.providerPlan.purchasedSeats > 0;
  }
}
