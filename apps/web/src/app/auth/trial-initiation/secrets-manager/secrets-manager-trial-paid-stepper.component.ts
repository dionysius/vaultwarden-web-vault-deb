import { Component, Input, ViewChild } from "@angular/core";

import { ProductTierType } from "@bitwarden/common/billing/enums";

import {
  OrganizationCreatedEvent,
  SubscriptionProduct,
  TrialOrganizationType,
} from "../../../billing/accounts/trial-initiation/trial-billing-step.component";
import { VerticalStepperComponent } from "../../trial-initiation/vertical-stepper/vertical-stepper.component";
import { SecretsManagerTrialFreeStepperComponent } from "../secrets-manager/secrets-manager-trial-free-stepper.component";

@Component({
  selector: "app-secrets-manager-trial-paid-stepper",
  templateUrl: "secrets-manager-trial-paid-stepper.component.html",
})
export class SecretsManagerTrialPaidStepperComponent extends SecretsManagerTrialFreeStepperComponent {
  @ViewChild("stepper", { static: false }) verticalStepper: VerticalStepperComponent;
  @Input() organizationTypeQueryParameter: string;

  billingSubLabel = this.i18nService.t("billingTrialSubLabel");
  organizationId: string;

  organizationCreated(event: OrganizationCreatedEvent) {
    this.organizationId = event.organizationId;
    this.billingSubLabel = event.planDescription;
    this.verticalStepper.next();
  }

  steppedBack() {
    this.verticalStepper.previous();
  }

  get createAccountLabel() {
    const organizationType =
      this.productType === ProductTierType.TeamsStarter
        ? "Teams Starter"
        : ProductTierType[this.productType];
    return `Before creating your ${organizationType} organization, you first need to log in or create a personal account.`;
  }

  get productType(): TrialOrganizationType {
    switch (this.organizationTypeQueryParameter) {
      case "enterprise":
        return ProductTierType.Enterprise;
      case "families":
        return ProductTierType.Families;
      case "teams":
        return ProductTierType.Teams;
      case "teamsStarter":
        return ProductTierType.TeamsStarter;
    }
  }

  protected readonly SubscriptionProduct = SubscriptionProduct;
}
