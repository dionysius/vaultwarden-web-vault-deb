import { CdkStepperModule } from "@angular/cdk/stepper";
import { NgModule } from "@angular/core";

import { FormFieldModule } from "@bitwarden/components";

import { SharedModule } from "../shared.module";
import { VerticalStepperModule } from "../vertical-stepper/vertical-stepper.module";

import { EnterpriseContentComponent } from "./enterprise-content.component";
import { FamiliesContentComponent } from "./families-content.component";
import { TeamsContentComponent } from "./teams-content.component";
import { TrialInitiationComponent } from "./trial-initiation.component";

@NgModule({
  imports: [SharedModule, CdkStepperModule, VerticalStepperModule, FormFieldModule],
  declarations: [
    TrialInitiationComponent,
    EnterpriseContentComponent,
    FamiliesContentComponent,
    TeamsContentComponent,
  ],
  exports: [TrialInitiationComponent],
})
export class TrialInitiationModule {}
