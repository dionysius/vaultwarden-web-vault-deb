import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Permissions } from "@bitwarden/common/enums/permissions";

import { PermissionsGuard } from "../../guards/permissions.guard";

import { OrganizationExportComponent } from "./org-export.component";
import { OrganizationImportComponent } from "./org-import.component";

const routes: Routes = [
  {
    path: "import",
    component: OrganizationImportComponent,
    canActivate: [PermissionsGuard],
    data: {
      titleId: "importData",
      permissions: [Permissions.AccessImportExport],
    },
  },
  {
    path: "export",
    component: OrganizationExportComponent,
    canActivate: [PermissionsGuard],
    data: {
      titleId: "exportVault",
      permissions: [Permissions.AccessImportExport],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class OrganizationImportExportRoutingModule {}
