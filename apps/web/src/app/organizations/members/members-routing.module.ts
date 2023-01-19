import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { canAccessMembersTab } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";

import { OrganizationPermissionsGuard } from "../guards/org-permissions.guard";

import { PeopleComponent } from "./people.component";

const routes: Routes = [
  {
    path: "",
    component: PeopleComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: {
      titleId: "members",
      organizationPermissions: canAccessMembersTab,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembersRoutingModule {}
