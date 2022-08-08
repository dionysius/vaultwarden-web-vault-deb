import { NgModule } from "@angular/core";

import { LinkSsoComponent } from "./organization-filter/link-sso.component";
import { OrganizationFilterComponent } from "./organization-filter/organization-filter.component";
import { OrganizationOptionsComponent } from "./organization-filter/organization-options.component";
import { VaultFilterSharedModule } from "./shared/vault-filter-shared.module";
import { VaultFilterComponent } from "./vault-filter.component";

@NgModule({
  imports: [VaultFilterSharedModule],
  declarations: [
    VaultFilterComponent,
    OrganizationFilterComponent,
    OrganizationOptionsComponent,
    LinkSsoComponent,
  ],
  exports: [VaultFilterComponent],
})
export class VaultFilterModule {}
