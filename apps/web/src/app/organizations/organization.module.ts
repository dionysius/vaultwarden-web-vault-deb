import { NgModule } from "@angular/core";

import { AccessSelectorModule } from "./components/access-selector";
import { OrgUpgradeDialogComponent } from "./manage/org-upgrade-dialog/org-upgrade-dialog.component";
import { OrganizationsRoutingModule } from "./organization-routing.module";
import { SharedOrganizationModule } from "./shared";

@NgModule({
  imports: [SharedOrganizationModule, AccessSelectorModule, OrganizationsRoutingModule],
  declarations: [OrgUpgradeDialogComponent],
})
export class OrganizationModule {}
