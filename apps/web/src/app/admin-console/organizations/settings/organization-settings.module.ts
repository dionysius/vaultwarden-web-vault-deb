import { NgModule } from "@angular/core";

import { LooseComponentsModule, SharedModule } from "../../../shared";
import { AccountFingerprintComponent } from "../../../shared/components/account-fingerprint/account-fingerprint.component";
import { PoliciesModule } from "../../organizations/policies";

import { AccountComponent } from "./account.component";
import { OrganizationSettingsRoutingModule } from "./organization-settings-routing.module";
import { SettingsComponent } from "./settings.component";
import { TwoFactorSetupComponent } from "./two-factor-setup.component";

@NgModule({
  imports: [
    SharedModule,
    LooseComponentsModule,
    PoliciesModule,
    OrganizationSettingsRoutingModule,
    AccountFingerprintComponent,
  ],
  declarations: [SettingsComponent, AccountComponent, TwoFactorSetupComponent],
})
export class OrganizationSettingsModule {}
