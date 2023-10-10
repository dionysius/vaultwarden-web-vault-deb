import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";

import { OrganizationPermissionsGuard } from "../../guards/org-permissions.guard";

import { OrganizationVaultExportComponent } from "./org-vault-export.component";

const routes: Routes = [
  {
    path: "",
    component: OrganizationVaultExportComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: {
      titleId: "exportVault",
      organizationPermissions: (org: Organization) => org.canAccessImportExport,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class OrganizationVaultExportRoutingModule {}
