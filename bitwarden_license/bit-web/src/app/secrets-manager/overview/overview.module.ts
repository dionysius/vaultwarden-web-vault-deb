import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { OverviewRoutingModule } from "./overview-routing.module";
import { OverviewComponent } from "./overview.component";
import { SectionComponent } from "./section.component";

@NgModule({
  imports: [SecretsManagerSharedModule, OverviewRoutingModule],
  declarations: [OverviewComponent, SectionComponent],
  providers: [],
})
export class OverviewModule {}
