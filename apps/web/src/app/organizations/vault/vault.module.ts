import { NgModule } from "@angular/core";

import { BreadcrumbsModule } from "@bitwarden/components";

import { LooseComponentsModule } from "../../shared/loose-components.module";
import { SharedModule } from "../../shared/shared.module";
import { OrganizationBadgeModule } from "../../vault/organization-badge/organization-badge.module";
import { PipesModule } from "../../vault/pipes/pipes.module";

import { CollectionBadgeModule } from "./collection-badge/collection-badge.module";
import { GroupBadgeModule } from "./group-badge/group-badge.module";
import { VaultFilterModule } from "./vault-filter/vault-filter.module";
import { VaultItemsComponent } from "./vault-items.component";
import { VaultRoutingModule } from "./vault-routing.module";
import { VaultComponent } from "./vault.component";

@NgModule({
  imports: [
    VaultRoutingModule,
    VaultFilterModule,
    SharedModule,
    LooseComponentsModule,
    GroupBadgeModule,
    CollectionBadgeModule,
    OrganizationBadgeModule,
    PipesModule,
    BreadcrumbsModule,
  ],
  declarations: [VaultComponent, VaultItemsComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
