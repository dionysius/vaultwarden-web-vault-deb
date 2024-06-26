import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { PlanType } from "@bitwarden/common/billing/enums";
import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { ProviderPlanResponse } from "@bitwarden/common/billing/models/response/provider-subscription-response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

import { WebProviderService } from "../../../admin-console/providers/services/web-provider.service";

type CreateClientDialogParams = {
  providerId: string;
  plans: PlanResponse[];
};

export enum CreateClientDialogResultType {
  Closed = "closed",
  Submitted = "submitted",
}

export const openCreateClientDialog = (
  dialogService: DialogService,
  dialogConfig: DialogConfig<CreateClientDialogParams>,
) =>
  dialogService.open<CreateClientDialogResultType, CreateClientDialogParams>(
    CreateClientDialogComponent,
    dialogConfig,
  );

type PlanCard = {
  name: string;
  cost: number;
  type: PlanType;
  plan: PlanResponse;
  selected: boolean;
};

@Component({
  templateUrl: "./create-client-dialog.component.html",
})
export class CreateClientDialogComponent implements OnInit {
  protected discountPercentage: number;
  protected formGroup = new FormGroup({
    clientOwnerEmail: new FormControl<string>("", [Validators.required, Validators.email]),
    organizationName: new FormControl<string>("", [Validators.required]),
    seats: new FormControl<number>(null, [Validators.required, Validators.min(1)]),
  });
  protected loading = true;
  protected planCards: PlanCard[];
  protected ResultType = CreateClientDialogResultType;

  private providerPlans: ProviderPlanResponse[];

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    @Inject(DIALOG_DATA) private dialogParams: CreateClientDialogParams,
    private dialogRef: DialogRef<CreateClientDialogResultType>,
    private i18nService: I18nService,
    private toastService: ToastService,
    private webProviderService: WebProviderService,
  ) {}

  protected getPlanCardContainerClasses(selected: boolean) {
    switch (selected) {
      case true: {
        return [
          "tw-group",
          "tw-cursor-pointer",
          "tw-block",
          "tw-rounded",
          "tw-border",
          "tw-border-solid",
          "tw-border-primary-600",
          "hover:tw-border-primary-700",
          "focus:tw-border-2",
          "focus:tw-border-primary-700",
          "focus:tw-rounded-lg",
        ];
      }
      case false: {
        return [
          "tw-cursor-pointer",
          "tw-block",
          "tw-rounded",
          "tw-border",
          "tw-border-solid",
          "tw-border-secondary-300",
          "hover:tw-border-text-main",
          "focus:tw-border-2",
          "focus:tw-border-primary-700",
        ];
      }
    }
  }

  async ngOnInit(): Promise<void> {
    const response = await this.billingApiService.getProviderSubscription(
      this.dialogParams.providerId,
    );

    this.providerPlans = response?.plans ?? [];

    const teamsPlan = this.dialogParams.plans.find((plan) => plan.type === PlanType.TeamsMonthly);
    const enterprisePlan = this.dialogParams.plans.find(
      (plan) => plan.type === PlanType.EnterpriseMonthly,
    );

    this.discountPercentage = response.discountPercentage;
    const discountFactor = this.discountPercentage ? (100 - this.discountPercentage) / 100 : 1;

    this.planCards = [
      {
        name: this.i18nService.t("planNameTeams"),
        cost: teamsPlan.PasswordManager.providerPortalSeatPrice * discountFactor,
        type: teamsPlan.type,
        plan: teamsPlan,
        selected: true,
      },
      {
        name: this.i18nService.t("planNameEnterprise"),
        cost: enterprisePlan.PasswordManager.providerPortalSeatPrice * discountFactor,
        type: enterprisePlan.type,
        plan: enterprisePlan,
        selected: false,
      },
    ];

    this.loading = false;
  }

  protected selectPlan(name: string) {
    this.planCards.find((planCard) => planCard.name === name).selected = true;
    this.planCards.find((planCard) => planCard.name !== name).selected = false;
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const selectedPlanCard = this.planCards.find((planCard) => planCard.selected);

    await this.webProviderService.createClientOrganization(
      this.dialogParams.providerId,
      this.formGroup.value.organizationName,
      this.formGroup.value.clientOwnerEmail,
      selectedPlanCard.type,
      this.formGroup.value.seats,
    );

    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("createdNewClient"),
    });

    this.dialogRef.close(this.ResultType.Submitted);
  };

  protected get openSeats(): number {
    const selectedProviderPlan = this.getSelectedProviderPlan();

    if (selectedProviderPlan === null) {
      return 0;
    }

    return selectedProviderPlan.seatMinimum - selectedProviderPlan.assignedSeats;
  }

  protected get unassignedSeats(): number {
    const unassignedSeats = this.openSeats - this.formGroup.value.seats;

    return unassignedSeats > 0 ? unassignedSeats : 0;
  }

  protected get additionalSeatsPurchased(): number {
    const selectedProviderPlan = this.getSelectedProviderPlan();

    if (selectedProviderPlan === null) {
      return 0;
    }

    const selectedSeats = this.formGroup.value.seats ?? 0;

    const purchased = selectedSeats - this.openSeats;

    return purchased > 0 ? purchased : 0;
  }

  private getSelectedProviderPlan(): ProviderPlanResponse {
    if (this.loading || !this.planCards) {
      return null;
    }
    const selectedPlan = this.planCards.find((planCard) => planCard.selected).plan;
    return this.providerPlans.find((providerPlan) => providerPlan.planName === selectedPlan.name);
  }
}
