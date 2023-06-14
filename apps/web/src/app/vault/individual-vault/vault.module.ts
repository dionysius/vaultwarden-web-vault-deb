import { NgModule } from "@angular/core";

import { BreadcrumbsModule } from "@bitwarden/components";

import { LooseComponentsModule, SharedModule } from "../../shared";
import { CollectionDialogModule } from "../components/collection-dialog";
import { VaultItemsModule } from "../components/vault-items/vault-items.module";
import { CollectionBadgeModule } from "../org-vault/collection-badge/collection-badge.module";
import { GroupBadgeModule } from "../org-vault/group-badge/group-badge.module";

import { BulkDialogsModule } from "./bulk-action-dialogs/bulk-dialogs.module";
import { OrganizationBadgeModule } from "./organization-badge/organization-badge.module";
import { PipesModule } from "./pipes/pipes.module";
import { VaultFilterModule } from "./vault-filter/vault-filter.module";
import { VaultHeaderComponent } from "./vault-header/vault-header.component";
import { VaultRoutingModule } from "./vault-routing.module";
import { VaultComponent } from "./vault.component";

@NgModule({
  imports: [
    VaultFilterModule,
    VaultRoutingModule,
    OrganizationBadgeModule,
    GroupBadgeModule,
    CollectionBadgeModule,
    PipesModule,
    SharedModule,
    LooseComponentsModule,
    BulkDialogsModule,
    BreadcrumbsModule,
    VaultItemsModule,
    CollectionDialogModule,
  ],
  declarations: [VaultComponent, VaultHeaderComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
