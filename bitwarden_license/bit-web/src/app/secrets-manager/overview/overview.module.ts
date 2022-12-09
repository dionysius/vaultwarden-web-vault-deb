import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { OverviewRoutingModule } from "./overview-routing.module";
import { OverviewComponent } from "./overview.component";

@NgModule({
  imports: [SecretsManagerSharedModule, OverviewRoutingModule],
  declarations: [OverviewComponent],
  providers: [],
})
export class OverviewModule {}
