import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";

import { OrganizationPermissionsGuard } from "../../guards/org-permissions.guard";

import { OrganizationImportComponent } from "./org-import.component";

const routes: Routes = [
  {
    path: "",
    component: OrganizationImportComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: {
      titleId: "importData",
      organizationPermissions: (org: Organization) => org.canAccessImportExport,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class OrganizationImportRoutingModule {}
