import { NgModule } from "@angular/core";

import { LooseComponentsModule, SharedModule } from "../../../../shared";

import { OrganizationVaultExportRoutingModule } from "./org-vault-export-routing.module";
import { OrganizationVaultExportComponent } from "./org-vault-export.component";

@NgModule({
  imports: [SharedModule, LooseComponentsModule, OrganizationVaultExportRoutingModule],
  declarations: [OrganizationVaultExportComponent],
})
export class OrganizationVaultExportModule {}
