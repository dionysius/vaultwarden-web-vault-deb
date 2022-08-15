import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/guards/auth.guard";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { OrganizationPermissionsGuard } from "src/app/organizations/guards/org-permissions.guard";
import { OrganizationLayoutComponent } from "src/app/organizations/layouts/organization-layout.component";
import { ManageComponent } from "src/app/organizations/manage/manage.component";
import { canAccessManageTab } from "src/app/organizations/navigation-permissions";

import { ScimComponent } from "./manage/scim.component";
import { SsoComponent } from "./manage/sso.component";

const routes: Routes = [
  {
    path: "organizations/:organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuard, OrganizationPermissionsGuard],
    children: [
      {
        path: "manage",
        component: ManageComponent,
        canActivate: [OrganizationPermissionsGuard],
        data: {
          organizationPermissions: canAccessManageTab,
        },
        children: [
          {
            path: "sso",
            component: SsoComponent,
            canActivate: [OrganizationPermissionsGuard],
            data: {
              organizationPermissions: (org: Organization) => org.canManageSso,
            },
          },
          {
            path: "scim",
            component: ScimComponent,
            canActivate: [OrganizationPermissionsGuard],
            data: {
              organizationPermissions: (org: Organization) => org.canManageScim,
            },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
