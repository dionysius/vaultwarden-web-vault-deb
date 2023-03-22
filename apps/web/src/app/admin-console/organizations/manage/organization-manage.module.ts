import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { EntityUsersComponent } from "../../../admin-console/organizations/manage/entity-users.component";
import { SharedModule } from "../../../shared";

@NgModule({
  imports: [SharedModule, ScrollingModule],
  declarations: [EntityUsersComponent],
  exports: [EntityUsersComponent],
})
export class OrganizationManageModule {}
