import { NgModule } from "@angular/core";

import { MultiSelectModule } from "@bitwarden/components";
import { CoreOrganizationModule } from "@bitwarden/web-vault/app/admin-console/organizations/core";
import { ProductSwitcherModule } from "@bitwarden/web-vault/app/layouts/product-switcher/product-switcher.module";
import { SharedModule } from "@bitwarden/web-vault/app/shared";

import { AccessSelectorComponent } from "./access-policies/access-selector.component";
import { AccessRemovalDialogComponent } from "./access-policies/dialogs/access-removal-dialog.component";
import { BulkStatusDialogComponent } from "./dialogs/bulk-status-dialog.component";
import { HeaderComponent } from "./header.component";
import { NewMenuComponent } from "./new-menu.component";
import { NoItemsComponent } from "./no-items.component";
import { ProjectsListComponent } from "./projects-list.component";
import { SecretsListComponent } from "./secrets-list.component";

@NgModule({
  imports: [SharedModule, ProductSwitcherModule, MultiSelectModule, CoreOrganizationModule],
  exports: [
    SharedModule,
    AccessRemovalDialogComponent,
    BulkStatusDialogComponent,
    HeaderComponent,
    NewMenuComponent,
    NoItemsComponent,
    ProjectsListComponent,
    SecretsListComponent,
    AccessSelectorComponent,
  ],
  declarations: [
    AccessRemovalDialogComponent,
    BulkStatusDialogComponent,
    HeaderComponent,
    NewMenuComponent,
    NoItemsComponent,
    ProjectsListComponent,
    SecretsListComponent,
    AccessSelectorComponent,
  ],
  providers: [],
  bootstrap: [],
})
export class SecretsManagerSharedModule {}
