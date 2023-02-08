import { NgModule } from "@angular/core";

import { BreadcrumbsModule } from "@bitwarden/components";

// TODO refine elsint rule for **/app/shared/* for both of these imports
// eslint-disable-next-line no-restricted-imports
import { LooseComponentsModule } from "../../app/shared/loose-components.module";
// eslint-disable-next-line no-restricted-imports
import { SharedModule } from "../../app/shared/shared.module";
import { OrganizationBadgeModule } from "../../vault/individual-vault/organization-badge/organization-badge.module";
import { PipesModule } from "../../vault/individual-vault/pipes/pipes.module";

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
