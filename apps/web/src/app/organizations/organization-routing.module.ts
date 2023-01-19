import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/guards/auth.guard";
import {
  canAccessOrgAdmin,
  canAccessGroupsTab,
  canAccessMembersTab,
  canAccessVaultTab,
  canAccessReportingTab,
  canAccessSettingsTab,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { OrganizationPermissionsGuard } from "./guards/org-permissions.guard";
import { OrganizationRedirectGuard } from "./guards/org-redirect.guard";
import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { CollectionsComponent } from "./manage/collections.component";
import { GroupsComponent } from "./manage/groups.component";
import { ManageComponent } from "./manage/manage.component";
import { VaultModule } from "./vault/vault.module";

const routes: Routes = [
  {
    path: ":organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuard, OrganizationPermissionsGuard],
    data: {
      organizationPermissions: canAccessOrgAdmin,
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        canActivate: [OrganizationRedirectGuard],
        data: {
          autoRedirectCallback: getOrganizationRoute,
        },
        children: [], // This is required to make the auto redirect work, },
      },
      {
        path: "vault",
        loadChildren: () => VaultModule,
      },
      {
        path: "settings",
        loadChildren: () => import("./settings").then((m) => m.OrganizationSettingsModule),
      },
      {
        path: "members",
        loadChildren: () => import("./members").then((m) => m.MembersModule),
      },
      {
        path: "groups",
        component: GroupsComponent,
        canActivate: [OrganizationPermissionsGuard],
        data: {
          titleId: "groups",
          organizationPermissions: canAccessGroupsTab,
        },
      },
      {
        path: "manage",
        component: ManageComponent,
        children: [
          {
            path: "collections",
            component: CollectionsComponent,
            data: {
              titleId: "collections",
            },
          },
        ],
      },
      {
        path: "reporting",
        loadChildren: () =>
          import("./reporting/organization-reporting.module").then(
            (m) => m.OrganizationReportingModule
          ),
      },
      {
        path: "billing",
        loadChildren: () =>
          import("./billing/organization-billing.module").then((m) => m.OrganizationBillingModule),
      },
    ],
  },
];

function getOrganizationRoute(organization: Organization): string {
  if (canAccessVaultTab(organization)) {
    return "vault";
  }
  if (canAccessMembersTab(organization)) {
    return "members";
  }
  if (canAccessGroupsTab(organization)) {
    return "groups";
  }
  if (canAccessReportingTab(organization)) {
    return "reporting";
  }
  if (canAccessSettingsTab(organization)) {
    return "settings";
  }
  return undefined;
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
