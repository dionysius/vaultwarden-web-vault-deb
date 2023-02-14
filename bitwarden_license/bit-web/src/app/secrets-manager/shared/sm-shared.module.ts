import { NgModule } from "@angular/core";

import { MultiSelectModule } from "@bitwarden/components";
import { ProductSwitcherModule } from "@bitwarden/web-vault/app/layouts/product-switcher/product-switcher.module";
import { CoreOrganizationModule } from "@bitwarden/web-vault/app/organizations/core";
import { SharedModule } from "@bitwarden/web-vault/app/shared";

import { AccessSelectorComponent } from "./access-policies/access-selector.component";
import { BulkStatusDialogComponent } from "./dialogs/bulk-status-dialog.component";
import { HeaderComponent } from "./header.component";
import { NewMenuComponent } from "./new-menu.component";
import { NoItemsComponent } from "./no-items.component";
import { SecretsListComponent } from "./secrets-list.component";

@NgModule({
  imports: [SharedModule, ProductSwitcherModule, MultiSelectModule, CoreOrganizationModule],
  exports: [
    SharedModule,
    BulkStatusDialogComponent,
    HeaderComponent,
    NewMenuComponent,
    NoItemsComponent,
    SecretsListComponent,
    AccessSelectorComponent,
  ],
  declarations: [
    BulkStatusDialogComponent,
    HeaderComponent,
    NewMenuComponent,
    NoItemsComponent,
    SecretsListComponent,
    AccessSelectorComponent,
  ],
  providers: [],
  bootstrap: [],
})
export class SecretsManagerSharedModule {}
