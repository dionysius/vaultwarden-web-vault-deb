import { NgModule } from "@angular/core";

import { BreadcrumbsModule } from "@bitwarden/components";

import { OrganizationBadgeModule } from "../../../vault/app/vault/organization-badge/organization-badge.module";
import { PipesModule } from "../../../vault/app/vault/pipes/pipes.module";
import { LooseComponentsModule } from "../../shared/loose-components.module";
import { SharedModule } from "../../shared/shared.module";

import { CollectionBadgeModule } from "./collection-badge/collection-badge.module";
import { GroupBadgeModule } from "./group-badge/group-badge.module";
import { VaultFilterModule } from "./vault-filter/vault-filter.module";
import { VaultHeaderComponent } from "./vault-header/vault-header.component";
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
  declarations: [VaultComponent, VaultItemsComponent, VaultHeaderComponent],
  exports: [VaultComponent],
})
export class VaultModule {}
