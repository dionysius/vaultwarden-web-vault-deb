import { NgModule } from "@angular/core";

import { AccessIntelligenceRoutingModule } from "./access-intelligence-routing.module";
import { RiskInsightsComponent } from "./risk-insights.component";

@NgModule({
  imports: [RiskInsightsComponent, AccessIntelligenceRoutingModule],
})
export class AccessIntelligenceModule {}
