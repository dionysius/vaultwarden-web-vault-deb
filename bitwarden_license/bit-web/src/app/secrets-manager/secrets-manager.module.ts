import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared";

import { LayoutModule } from "./layout/layout.module";
import { SecretsManagerSharedModule } from "./shared/sm-shared.module";
import { SecretsManagerRoutingModule } from "./sm-routing.module";
import { SMGuard } from "./sm.guard";

@NgModule({
  imports: [SharedModule, SecretsManagerSharedModule, SecretsManagerRoutingModule, LayoutModule],
  providers: [SMGuard],
})
export class SecretsManagerModule {}
