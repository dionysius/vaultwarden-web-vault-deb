import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { IntegrationCardComponent } from "./integration-card/integration-card.component";
import { IntegrationGridComponent } from "./integration-grid/integration-grid.component";
import { IntegrationsRoutingModule } from "./integrations-routing.module";
import { IntegrationsComponent } from "./integrations.component";

@NgModule({
  imports: [SecretsManagerSharedModule, IntegrationsRoutingModule],
  declarations: [IntegrationsComponent, IntegrationGridComponent, IntegrationCardComponent],
  providers: [],
})
export class IntegrationsModule {}
