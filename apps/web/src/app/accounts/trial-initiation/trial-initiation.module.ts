import { CdkStepperModule } from "@angular/cdk/stepper";
import { TitleCasePipe } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormFieldModule } from "@bitwarden/components";

import { OrganizationCreateModule } from "../../organizations/create/organization-create.module";
import { LooseComponentsModule, SharedModule } from "../../shared";
import { RegisterFormModule } from "../register-form/register-form.module";

import { BillingComponent } from "./billing.component";
import { ConfirmationDetailsComponent } from "./confirmation-details.component";
import { EnterpriseContentComponent } from "./enterprise-content.component";
import { FamiliesContentComponent } from "./families-content.component";
import { TeamsContentComponent } from "./teams-content.component";
import { TrialInitiationComponent } from "./trial-initiation.component";
import { VerticalStepperModule } from "./vertical-stepper/vertical-stepper.module";

@NgModule({
  imports: [
    SharedModule,
    CdkStepperModule,
    VerticalStepperModule,
    FormFieldModule,
    RegisterFormModule,
    OrganizationCreateModule,
    LooseComponentsModule,
  ],
  declarations: [
    TrialInitiationComponent,
    EnterpriseContentComponent,
    FamiliesContentComponent,
    TeamsContentComponent,
    ConfirmationDetailsComponent,
    BillingComponent,
  ],
  exports: [TrialInitiationComponent],
  providers: [TitleCasePipe],
})
export class TrialInitiationModule {}
