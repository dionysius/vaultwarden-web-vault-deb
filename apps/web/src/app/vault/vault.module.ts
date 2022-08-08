import { NgModule } from "@angular/core";

import { CiphersComponent } from "./ciphers.component";
import { VaultSharedModule } from "./shared/vault-shared.module";
import { VaultRoutingModule } from "./vault-routing.module";
import { VaultComponent } from "./vault.component";

@NgModule({
  imports: [VaultSharedModule, VaultRoutingModule],
  declarations: [VaultComponent, CiphersComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
