import { NgModule } from "@angular/core";

import { OrganizationBadgeModule } from "./organization-badge/organization-badge.module";
import { VaultSharedModule } from "./shared/vault-shared.module";
import { VaultItemsComponent } from "./vault-items.component";
import { VaultRoutingModule } from "./vault-routing.module";
import { VaultComponent } from "./vault.component";

@NgModule({
  imports: [VaultSharedModule, VaultRoutingModule, OrganizationBadgeModule],
  declarations: [VaultComponent, VaultItemsComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
