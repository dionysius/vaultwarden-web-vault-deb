import { NgModule } from "@angular/core";

// TODO refine elsint rule for **/app/shared/*
// eslint-disable-next-line no-restricted-imports
import { SharedModule } from "../../../../../app/shared";

import { VaultFilterSectionComponent } from "./components/vault-filter-section.component";

@NgModule({
  imports: [SharedModule],
  declarations: [VaultFilterSectionComponent],
  exports: [SharedModule, VaultFilterSectionComponent],
})
export class VaultFilterSharedModule {}
