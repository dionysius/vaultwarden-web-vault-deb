import { NgModule } from "@angular/core";

import { OrganizationBadgeModule } from "../../vault/organization-badge/organization-badge.module";
import { VaultSharedModule } from "../../vault/shared/vault-shared.module";

import { VaultFilterModule } from "./vault-filter/vault-filter.module";
import { VaultItemsComponent } from "./vault-items.component";
import { VaultRoutingModule } from "./vault-routing.module";
import { VaultComponent } from "./vault.component";

@NgModule({
  imports: [VaultSharedModule, VaultRoutingModule, VaultFilterModule, OrganizationBadgeModule],
  declarations: [VaultComponent, VaultItemsComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
