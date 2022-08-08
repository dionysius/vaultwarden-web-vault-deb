import { NgModule } from "@angular/core";

import { VaultFilterSharedModule } from "../../../vault/vault-filter/shared/vault-filter-shared.module";

import { VaultFilterComponent } from "./vault-filter.component";

@NgModule({
  imports: [VaultFilterSharedModule],
  declarations: [VaultFilterComponent],
  exports: [VaultFilterComponent],
})
export class VaultFilterModule {}
