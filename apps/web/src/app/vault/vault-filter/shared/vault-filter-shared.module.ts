import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared";

import { CollectionFilterComponent } from "./collection-filter/collection-filter.component";
import { FolderFilterComponent } from "./folder-filter/folder-filter.component";
import { StatusFilterComponent } from "./status-filter/status-filter.component";
import { TypeFilterComponent } from "./type-filter/type-filter.component";
import { VaultFilterService } from "./vault-filter.service";

@NgModule({
  imports: [SharedModule],
  declarations: [
    CollectionFilterComponent,
    FolderFilterComponent,
    StatusFilterComponent,
    TypeFilterComponent,
  ],
  exports: [
    SharedModule,
    CollectionFilterComponent,
    FolderFilterComponent,
    StatusFilterComponent,
    TypeFilterComponent,
  ],
  providers: [VaultFilterService],
})
export class VaultFilterSharedModule {}
