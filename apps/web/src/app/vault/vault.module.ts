import { NgModule } from "@angular/core";

import { CiphersComponent } from "./ciphers.component";
import { OrganizationBadgeModule } from "./organization-badge/organization-badge.module";
import { VaultSharedModule } from "./shared/vault-shared.module";
import { VaultRoutingModule } from "./vault-routing.module";
import { VaultComponent } from "./vault.component";

@NgModule({
  imports: [VaultSharedModule, VaultRoutingModule, OrganizationBadgeModule],
  declarations: [VaultComponent, CiphersComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
