import { NgModule } from "@angular/core";

import { OrganizationUserModule } from "./admin-console/organizations/users/organization-user.module";
import { LoginModule } from "./auth/login/login.module";
import { TrialInitiationModule } from "./auth/trial-initiation/trial-initiation.module";
import { LooseComponentsModule, SharedModule } from "./shared";
import { OrganizationBadgeModule } from "./vault/individual-vault/organization-badge/organization-badge.module";
import { VaultFilterModule } from "./vault/individual-vault/vault-filter/vault-filter.module";

@NgModule({
  imports: [
    SharedModule,
    LooseComponentsModule,
    TrialInitiationModule,
    VaultFilterModule,
    OrganizationBadgeModule,
    OrganizationUserModule,
    LoginModule,
  ],
  exports: [
    SharedModule,
    LooseComponentsModule,
    TrialInitiationModule,
    VaultFilterModule,
    OrganizationBadgeModule,
    LoginModule,
  ],
  bootstrap: [],
})
export class OssModule {}
