import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared";

import { LayoutComponent } from "./layout/layout.component";
import { NavigationComponent } from "./layout/navigation.component";
import { OrgSwitcherComponent } from "./layout/org-switcher.component";
import { SecretsManagerSharedModule } from "./shared/sm-shared.module";
import { SecretsManagerRoutingModule } from "./sm-routing.module";
import { SMGuard } from "./sm.guard";

@NgModule({
  imports: [SharedModule, SecretsManagerSharedModule, SecretsManagerRoutingModule],
  declarations: [LayoutComponent, NavigationComponent, OrgSwitcherComponent],
  providers: [SMGuard],
})
export class SecretsManagerModule {}
