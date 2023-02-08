import { NgModule } from "@angular/core";

import { SharedModule } from "../../../../app/shared";

import { VaultFilterSectionComponent } from "./components/vault-filter-section.component";

@NgModule({
  imports: [SharedModule],
  declarations: [VaultFilterSectionComponent],
  exports: [SharedModule, VaultFilterSectionComponent],
})
export class VaultFilterSharedModule {}
