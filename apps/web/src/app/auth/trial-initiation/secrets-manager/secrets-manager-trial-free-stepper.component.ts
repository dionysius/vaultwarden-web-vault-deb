import { Component, ViewChild } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { OrganizationBillingServiceAbstraction as OrganizationBillingService } from "@bitwarden/common/billing/abstractions/organization-billing.service";
import { PlanType } from "@bitwarden/common/billing/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { VerticalStepperComponent } from "../../trial-initiation/vertical-stepper/vertical-stepper.component";

@Component({
  selector: "app-secrets-manager-trial-free-stepper",
  templateUrl: "secrets-manager-trial-free-stepper.component.html",
})
export class SecretsManagerTrialFreeStepperComponent {
  @ViewChild("stepper", { static: false }) verticalStepper: VerticalStepperComponent;

  formGroup = this.formBuilder.group({
    name: [
      "",
      {
        validators: [Validators.required, Validators.maxLength(50)],
        updateOn: "change",
      },
    ],
    email: [
      "",
      {
        validators: [Validators.email],
      },
    ],
  });

  subLabels = {
    createAccount:
      "Before creating your free organization, you first need to log in or create a personal account.",
    organizationInfo: "Enter your organization information",
  };

  organizationId: string;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected i18nService: I18nService,
    protected organizationBillingService: OrganizationBillingService,
    private router: Router,
  ) {}

  accountCreated(email: string): void {
    this.formGroup.get("email")?.setValue(email);
    this.subLabels.createAccount = email;
    this.verticalStepper.next();
  }

  async createOrganization(): Promise<void> {
    const response = await this.organizationBillingService.startFree({
      organization: {
        name: this.formGroup.get("name").value,
        billingEmail: this.formGroup.get("email").value,
      },
      plan: {
        type: PlanType.Free,
        subscribeToSecretsManager: true,
        isFromSecretsManagerTrial: true,
      },
    });

    this.organizationId = response.id;
    this.subLabels.organizationInfo = response.name;
    this.verticalStepper.next();
  }

  async navigateTo(organizationRoute: string): Promise<void> {
    await this.router.navigate(["organizations", this.organizationId, organizationRoute]);
  }
}
