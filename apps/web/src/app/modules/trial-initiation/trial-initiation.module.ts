import { CdkStepperModule } from "@angular/cdk/stepper";
import { NgModule } from "@angular/core";

import { FormFieldModule } from "@bitwarden/components";

import { RegisterFormModule } from "../register-form/register-form.module";
import { SharedModule } from "../shared.module";
import { VerticalStepperModule } from "../vertical-stepper/vertical-stepper.module";

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
  ],
  declarations: [
    TrialInitiationComponent,
    EnterpriseContentComponent,
    FamiliesContentComponent,
    TeamsContentComponent,
  ],
  exports: [TrialInitiationComponent],
})
export class TrialInitiationModule {}
