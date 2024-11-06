import { NgModule } from "@angular/core";

import { RiskInsightsRoutingModule } from "./risk-insights-routing.module";
import { RiskInsightsComponent } from "./risk-insights.component";

@NgModule({
  imports: [RiskInsightsComponent, RiskInsightsRoutingModule],
})
export class RiskInsightsModule {}
