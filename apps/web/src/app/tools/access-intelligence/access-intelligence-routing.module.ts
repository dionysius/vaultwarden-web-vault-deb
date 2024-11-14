import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { canAccessFeature } from "@bitwarden/angular/platform/guard/feature-flag.guard";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

import { RiskInsightsComponent } from "./risk-insights.component";

const routes: Routes = [
  {
    path: "risk-insights",
    canActivate: [canAccessFeature(FeatureFlag.AccessIntelligence)],
    component: RiskInsightsComponent,
    data: {
      titleId: "RiskInsights",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessIntelligenceRoutingModule {}
