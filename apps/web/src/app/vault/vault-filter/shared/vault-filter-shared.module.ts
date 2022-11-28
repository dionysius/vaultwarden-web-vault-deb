import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared";
import { LinkSsoComponent } from "../organization-filter/link-sso.component";
import { OrganizationFilterComponent } from "../organization-filter/organization-filter.component";
import { OrganizationOptionsComponent } from "../organization-filter/organization-options.component";

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
    OrganizationFilterComponent,
    OrganizationOptionsComponent,
    LinkSsoComponent,
  ],
  exports: [
    SharedModule,
    CollectionFilterComponent,
    FolderFilterComponent,
    StatusFilterComponent,
    TypeFilterComponent,
    OrganizationFilterComponent,
    OrganizationOptionsComponent,
    LinkSsoComponent,
  ],
  providers: [VaultFilterService],
})
export class VaultFilterSharedModule {}
