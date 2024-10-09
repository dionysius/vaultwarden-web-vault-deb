import { NgModule } from "@angular/core";

import { AccessIntelligenceRoutingModule } from "./access-intelligence-routing.module";
import { AccessIntelligenceComponent } from "./access-intelligence.component";

@NgModule({
  imports: [AccessIntelligenceComponent, AccessIntelligenceRoutingModule],
})
export class AccessIntelligenceModule {}
