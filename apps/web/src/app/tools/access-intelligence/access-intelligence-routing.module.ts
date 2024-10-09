import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { unauthGuardFn } from "@bitwarden/angular/auth/guards";
import { canAccessFeature } from "@bitwarden/angular/platform/guard/feature-flag.guard";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

import { AccessIntelligenceComponent } from "./access-intelligence.component";

const routes: Routes = [
  {
    path: "",
    component: AccessIntelligenceComponent,
    canActivate: [canAccessFeature(FeatureFlag.AccessIntelligence), unauthGuardFn()],
    data: {
      titleId: "accessIntelligence",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessIntelligenceRoutingModule {}
