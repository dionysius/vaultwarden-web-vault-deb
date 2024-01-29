import { Component, Input, ViewChild } from "@angular/core";

import { VerticalStepperComponent } from "../../trial-initiation/vertical-stepper/vertical-stepper.component";
import { SecretsManagerTrialFreeStepperComponent } from "../secrets-manager/secrets-manager-trial-free-stepper.component";

import {
  OrganizationCreatedEvent,
  SubscriptionType,
} from "./secrets-manager-trial-billing-step.component";

@Component({
  selector: "app-secrets-manager-trial-paid-stepper",
  templateUrl: "secrets-manager-trial-paid-stepper.component.html",
})
export class SecretsManagerTrialPaidStepperComponent extends SecretsManagerTrialFreeStepperComponent {
  @ViewChild("stepper", { static: false }) verticalStepper: VerticalStepperComponent;
  @Input() subscriptionType: string;

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
      this.paidSubscriptionType == SubscriptionType.Enterprise ? "Enterprise" : "Teams";
    return `Before creating your ${organizationType} organization, you first need to log in or create a personal account.`;
  }

  get paidSubscriptionType() {
    switch (this.subscriptionType) {
      case "enterprise":
        return SubscriptionType.Enterprise;
      case "teams":
        return SubscriptionType.Teams;
    }
  }
}
