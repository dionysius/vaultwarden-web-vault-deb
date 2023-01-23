import { NgModule } from "@angular/core";

import { NavigationModule } from "@bitwarden/components";
import { SharedModule } from "@bitwarden/web-vault/app/shared/shared.module";

import { LayoutComponent } from "./layout.component";
import { NavigationComponent } from "./navigation.component";
import { OrgSwitcherComponent } from "./org-switcher.component";

@NgModule({
  imports: [SharedModule, NavigationModule],
  declarations: [LayoutComponent, NavigationComponent, OrgSwitcherComponent],
})
export class LayoutModule {}
