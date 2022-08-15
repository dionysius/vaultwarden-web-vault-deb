import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Organization } from "@bitwarden/common/models/domain/organization";

import { OrganizationPermissionsGuard } from "../../guards/org-permissions.guard";

import { OrganizationExportComponent } from "./org-export.component";
import { OrganizationImportComponent } from "./org-import.component";

const routes: Routes = [
  {
    path: "import",
    component: OrganizationImportComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: {
      titleId: "importData",
      organizationPermissions: (org: Organization) => org.canAccessImportExport,
    },
  },
  {
    path: "export",
    component: OrganizationExportComponent,
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
export class OrganizationImportExportRoutingModule {}
