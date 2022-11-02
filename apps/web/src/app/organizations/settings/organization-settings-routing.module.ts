import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { canAccessSettingsTab } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { OrganizationPermissionsGuard } from "../guards/org-permissions.guard";
import { PoliciesComponent } from "../policies";

import { AccountComponent } from "./account.component";
import { SettingsComponent } from "./settings.component";
import { TwoFactorSetupComponent } from "./two-factor-setup.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: { organizationPermissions: canAccessSettingsTab },
    children: [
      { path: "", pathMatch: "full", redirectTo: "account" },
      { path: "account", component: AccountComponent, data: { titleId: "organizationInfo" } },
      {
        path: "two-factor",
        component: TwoFactorSetupComponent,
        data: { titleId: "twoStepLogin" },
      },
      {
        path: "policies",
        component: PoliciesComponent,
        canActivate: [OrganizationPermissionsGuard],
        data: {
          organizationPermissions: (org: Organization) => org.canManagePolicies,
          titleId: "policies",
        },
      },
      {
        path: "tools",
        loadChildren: () =>
          import("../tools/import-export/org-import-export.module").then(
            (m) => m.OrganizationImportExportModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationSettingsRoutingModule {}
