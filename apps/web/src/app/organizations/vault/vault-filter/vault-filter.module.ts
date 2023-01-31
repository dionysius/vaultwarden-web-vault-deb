import { NgModule } from "@angular/core";

import { VaultFilterService as VaultFilterServiceAbstraction } from "../../../../vault/app/vault/vault-filter/services/abstractions/vault-filter.service";
import { VaultFilterSharedModule } from "../../../../vault/app/vault/vault-filter/shared/vault-filter-shared.module";

import { VaultFilterComponent } from "./vault-filter.component";
import { VaultFilterService } from "./vault-filter.service";

@NgModule({
  imports: [VaultFilterSharedModule],
  declarations: [VaultFilterComponent],
  exports: [VaultFilterComponent],
  providers: [
    {
      provide: VaultFilterServiceAbstraction,
      useClass: VaultFilterService,
    },
  ],
})
export class VaultFilterModule {}
