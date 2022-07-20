import { CdkStepperModule } from "@angular/cdk/stepper";
import { TitleCasePipe } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormFieldModule } from "@bitwarden/components";

import { OrganizationCreateModule } from "../organizations/create/organization-create.module";
import { RegisterFormModule } from "../register-form/register-form.module";
import { SharedModule } from "../shared.module";
import { VerticalStepperModule } from "../vertical-stepper/vertical-stepper.module";

import { BillingModule } from "./../billing/billing.module";
import { ConfirmationDetailsComponent } from "./confirmation-details.component";
import { EnterpriseContentComponent } from "./enterprise-content.component";
import { FamiliesContentComponent } from "./families-content.component";
import { TeamsContentComponent } from "./teams-content.component";
import { TrialInitiationComponent } from "./trial-initiation.component";

@NgModule({
  imports: [
    SharedModule,
    CdkStepperModule,
    VerticalStepperModule,
    FormFieldModule,
    RegisterFormModule,
    OrganizationCreateModule,
    BillingModule,
  ],
  declarations: [
    TrialInitiationComponent,
    EnterpriseContentComponent,
    FamiliesContentComponent,
    TeamsContentComponent,
    ConfirmationDetailsComponent,
  ],
  exports: [TrialInitiationComponent],
  providers: [TitleCasePipe],
})
export class TrialInitiationModule {}
