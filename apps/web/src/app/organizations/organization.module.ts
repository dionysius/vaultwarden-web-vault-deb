import { NgModule } from "@angular/core";

import { AccessSelectorModule } from "./components/access-selector";
import { OrganizationsRoutingModule } from "./organization-routing.module";
import { SharedOrganizationModule } from "./shared";

@NgModule({
  imports: [SharedOrganizationModule, AccessSelectorModule, OrganizationsRoutingModule],
})
export class OrganizationModule {}
