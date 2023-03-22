import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { OrganizationPermissionsGuard } from "@bitwarden/web-vault/app/admin-console/organizations/guards/org-permissions.guard";

import { SecretsManagerExportComponent } from "./porting/sm-export.component";
import { SecretsManagerImportComponent } from "./porting/sm-import.component";

const routes: Routes = [
  {
    path: "import",
    component: SecretsManagerImportComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: {
      titleId: "importData",
      organizationPermissions: (org: Organization) => org.isAdmin,
    },
  },
  {
    path: "export",
    component: SecretsManagerExportComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: {
      titleId: "exportData",
      organizationPermissions: (org: Organization) => org.isAdmin,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
