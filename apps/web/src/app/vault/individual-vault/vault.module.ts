import { NgModule } from "@angular/core";

import { BannerModule, BreadcrumbsModule } from "@bitwarden/components";

import { VerifyEmailComponent } from "../../auth/settings/verify-email.component";
import { LooseComponentsModule, SharedModule } from "../../shared";
import { CollectionDialogModule } from "../components/collection-dialog";
import { VaultItemsModule } from "../components/vault-items/vault-items.module";
import { CollectionBadgeModule } from "../org-vault/collection-badge/collection-badge.module";
import { GroupBadgeModule } from "../org-vault/group-badge/group-badge.module";

import { BulkDialogsModule } from "./bulk-action-dialogs/bulk-dialogs.module";
import { OrganizationBadgeModule } from "./organization-badge/organization-badge.module";
import { PipesModule } from "./pipes/pipes.module";
import { VaultBannersService } from "./vault-banners/services/vault-banners.service";
import { VaultBannersComponent } from "./vault-banners/vault-banners.component";
import { VaultFilterModule } from "./vault-filter/vault-filter.module";
import { VaultHeaderComponent } from "./vault-header/vault-header.component";
import { VaultOnboardingService as VaultOnboardingServiceAbstraction } from "./vault-onboarding/services/abstraction/vault-onboarding.service";
import { VaultOnboardingService } from "./vault-onboarding/services/vault-onboarding.service";
import { VaultOnboardingComponent } from "./vault-onboarding/vault-onboarding.component";
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
    VaultOnboardingComponent,
    BannerModule,
    VerifyEmailComponent,
  ],
  declarations: [VaultComponent, VaultHeaderComponent, VaultBannersComponent],
  exports: [VaultComponent],
  providers: [
    VaultBannersService,
    {
      provide: VaultOnboardingServiceAbstraction,
      useClass: VaultOnboardingService,
    },
  ],
})
export class VaultModule {}
