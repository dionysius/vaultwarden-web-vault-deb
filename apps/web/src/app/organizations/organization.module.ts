import { NgModule } from "@angular/core";

import { CoreOrganizationModule } from "./core";
import { GroupAddEditComponent } from "./manage/group-add-edit.component";
import { GroupsComponent } from "./manage/groups.component";
import { OrgUpgradeDialogComponent } from "./manage/org-upgrade-dialog/org-upgrade-dialog.component";
import { OrganizationsRoutingModule } from "./organization-routing.module";
import { SharedOrganizationModule } from "./shared";
import { AccessSelectorModule } from "./shared/components/access-selector";

@NgModule({
  imports: [
    SharedOrganizationModule,
    AccessSelectorModule,
    CoreOrganizationModule,
    OrganizationsRoutingModule,
  ],
  declarations: [GroupsComponent, GroupAddEditComponent, OrgUpgradeDialogComponent],
})
export class OrganizationModule {}
