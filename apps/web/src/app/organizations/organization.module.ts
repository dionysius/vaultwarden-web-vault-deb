import { NgModule } from "@angular/core";

import { GroupAddEditComponent } from "../admin-console/organizations/manage/group-add-edit.component";
import { GroupsComponent } from "../admin-console/organizations/manage/groups.component";
import { OrganizationsRoutingModule } from "../admin-console/organizations/organization-routing.module";
import { AccessSelectorModule } from "../admin-console/organizations/shared/components/access-selector";

import { CoreOrganizationModule } from "./core";
import { SharedOrganizationModule } from "./shared";

@NgModule({
  imports: [
    SharedOrganizationModule,
    AccessSelectorModule,
    CoreOrganizationModule,
    OrganizationsRoutingModule,
  ],
  declarations: [GroupsComponent, GroupAddEditComponent],
})
export class OrganizationModule {}
