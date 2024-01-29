import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationBillingServiceAbstraction as OrganizationBillingService } from "@bitwarden/common/billing/abstractions/organization-billing.service";
import { PaymentMethodType, PlanType } from "@bitwarden/common/billing/enums";
import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { ProductType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { BillingSharedModule, PaymentComponent, TaxInfoComponent } from "../../../billing/shared";

export interface OrganizationInfo {
  name: string;
  email: string;
}

export interface OrganizationCreatedEvent {
  organizationId: string;
  planDescription: string;
}

enum SubscriptionCadence {
  Monthly,
  Annual,
}

export enum SubscriptionType {
  Teams,
  Enterprise,
}

@Component({
  selector: "app-secrets-manager-trial-billing-step",
  templateUrl: "secrets-manager-trial-billing-step.component.html",
  imports: [BillingSharedModule],
  standalone: true,
})
export class SecretsManagerTrialBillingStepComponent implements OnInit {
  @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;
  @ViewChild(TaxInfoComponent) taxInfoComponent: TaxInfoComponent;
  @Input() organizationInfo: OrganizationInfo;
  @Input() subscriptionType: SubscriptionType;
  @Output() steppedBack = new EventEmitter();
  @Output() organizationCreated = new EventEmitter<OrganizationCreatedEvent>();

  loading = true;

  annualCadence = SubscriptionCadence.Annual;
  monthlyCadence = SubscriptionCadence.Monthly;

  formGroup = this.formBuilder.group({
    cadence: [SubscriptionCadence.Annual, Validators.required],
  });
  formPromise: Promise<string>;

  applicablePlans: PlanResponse[];
  annualPlan: PlanResponse;
  monthlyPlan: PlanResponse;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private formBuilder: FormBuilder,
    private messagingService: MessagingService,
    private organizationBillingService: OrganizationBillingService,
    private platformUtilsService: PlatformUtilsService,
  ) {}

  async ngOnInit(): Promise<void> {
    const plans = await this.apiService.getPlans();
    this.applicablePlans = plans.data.filter(this.isApplicable);
    this.annualPlan = this.findPlanFor(SubscriptionCadence.Annual);
    this.monthlyPlan = this.findPlanFor(SubscriptionCadence.Monthly);
    this.loading = false;
  }

  async submit(): Promise<void> {
    this.formPromise = this.createOrganization();

    const organizationId = await this.formPromise;
    const planDescription = this.getPlanDescription();

    this.platformUtilsService.showToast(
      "success",
      this.i18nService.t("organizationCreated"),
      this.i18nService.t("organizationReadyToGo"),
    );

    this.organizationCreated.emit({
      organizationId,
      planDescription,
    });

    this.messagingService.send("organizationCreated", organizationId);
  }

  protected changedCountry() {
    this.paymentComponent.hideBank = this.taxInfoComponent.taxInfo.country !== "US";
    if (
      this.paymentComponent.hideBank &&
      this.paymentComponent.method === PaymentMethodType.BankAccount
    ) {
      this.paymentComponent.method = PaymentMethodType.Card;
      this.paymentComponent.changeMethod();
    }
  }

  protected stepBack() {
    this.steppedBack.emit();
  }

  private async createOrganization(): Promise<string> {
    const plan = this.findPlanFor(this.formGroup.value.cadence);
    const paymentMethod = await this.paymentComponent.createPaymentToken();

    const response = await this.organizationBillingService.purchaseSubscription({
      organization: {
        name: this.organizationInfo.name,
        billingEmail: this.organizationInfo.email,
      },
      plan: {
        type: plan.type,
        passwordManagerSeats: 1,
        subscribeToSecretsManager: true,
        isFromSecretsManagerTrial: true,
        secretsManagerSeats: 1,
      },
      payment: {
        paymentMethod,
        billing: {
          postalCode: this.taxInfoComponent.taxInfo.postalCode,
          country: this.taxInfoComponent.taxInfo.country,
          taxId: this.taxInfoComponent.taxInfo.taxId,
          addressLine1: this.taxInfoComponent.taxInfo.line1,
          addressLine2: this.taxInfoComponent.taxInfo.line2,
          city: this.taxInfoComponent.taxInfo.city,
          state: this.taxInfoComponent.taxInfo.state,
        },
      },
    });

    return response.id;
  }

  private findPlanFor(cadence: SubscriptionCadence) {
    switch (this.subscriptionType) {
      case SubscriptionType.Teams:
        return cadence === SubscriptionCadence.Annual
          ? this.applicablePlans.find((plan) => plan.type === PlanType.TeamsAnnually)
          : this.applicablePlans.find((plan) => plan.type === PlanType.TeamsMonthly);
      case SubscriptionType.Enterprise:
        return cadence === SubscriptionCadence.Annual
          ? this.applicablePlans.find((plan) => plan.type === PlanType.EnterpriseAnnually)
          : this.applicablePlans.find((plan) => plan.type === PlanType.EnterpriseMonthly);
    }
  }

  private getPlanDescription(): string {
    const plan = this.findPlanFor(this.formGroup.value.cadence);
    const price =
      plan.SecretsManager.basePrice === 0
        ? plan.SecretsManager.seatPrice
        : plan.SecretsManager.basePrice;

    switch (this.formGroup.value.cadence) {
      case SubscriptionCadence.Annual:
        return `${this.i18nService.t("annual")} ($${price}/${this.i18nService.t("yr")})`;
      case SubscriptionCadence.Monthly:
        return `${this.i18nService.t("monthly")} ($${price}/${this.i18nService.t("monthAbbr")})`;
    }
  }

  private isApplicable(plan: PlanResponse): boolean {
    const hasSecretsManager = !!plan.SecretsManager;
    const isTeamsOrEnterprise =
      plan.product === ProductType.Teams || plan.product === ProductType.Enterprise;
    const notDisabledOrLegacy = !plan.disabled && !plan.legacyYear;
    return hasSecretsManager && isTeamsOrEnterprise && notDisabledOrLegacy;
  }
}
