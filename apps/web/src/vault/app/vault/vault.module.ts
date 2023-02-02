import { NgModule } from "@angular/core";

import { BreadcrumbsModule } from "@bitwarden/components";

import { CollectionBadgeModule } from "../../../app/organizations/vault/collection-badge/collection-badge.module";
import { GroupBadgeModule } from "../../../app/organizations/vault/group-badge/group-badge.module";
import { LooseComponentsModule, SharedModule } from "../../../app/shared";

import { BulkDialogsModule } from "./bulk-action-dialogs/bulk-dialogs.module";
import { OrganizationBadgeModule } from "./organization-badge/organization-badge.module";
import { PipesModule } from "./pipes/pipes.module";
import { VaultFilterModule } from "./vault-filter/vault-filter.module";
import { VaultHeaderComponent } from "./vault-header/vault-header.component";
import { VaultItemsComponent } from "./vault-items.component";
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
  ],
  declarations: [VaultComponent, VaultItemsComponent, VaultHeaderComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
