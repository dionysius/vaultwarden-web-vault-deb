import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { AccessSelectorModule } from "./components/access-selector";
import { OrganizationsRoutingModule } from "./organization-routing.module";

@NgModule({
  imports: [SharedModule, AccessSelectorModule, OrganizationsRoutingModule],
})
export class OrganizationModule {}
