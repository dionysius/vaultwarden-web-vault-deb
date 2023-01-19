import { NgModule } from "@angular/core";

import { LinkSsoComponent } from "./components/link-sso.component";
import { OrganizationOptionsComponent } from "./components/organization-options.component";
import { VaultFilterComponent } from "./components/vault-filter.component";
import { VaultFilterService as VaultFilterServiceAbstraction } from "./services/abstractions/vault-filter.service";
import { VaultFilterService } from "./services/vault-filter.service";
import { VaultFilterSharedModule } from "./shared/vault-filter-shared.module";

@NgModule({
  imports: [VaultFilterSharedModule],
  declarations: [VaultFilterComponent, OrganizationOptionsComponent, LinkSsoComponent],
  exports: [VaultFilterComponent],
  providers: [
    {
      provide: VaultFilterServiceAbstraction,
      useClass: VaultFilterService,
    },
  ],
})
export class VaultFilterModule {}
