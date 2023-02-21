import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { OnboardingModule } from "./onboarding.module";
import { OverviewRoutingModule } from "./overview-routing.module";
import { OverviewComponent } from "./overview.component";
import { SectionComponent } from "./section.component";

@NgModule({
  imports: [SecretsManagerSharedModule, OverviewRoutingModule, OnboardingModule],
  declarations: [OverviewComponent, SectionComponent],
  providers: [],
})
export class OverviewModule {}
