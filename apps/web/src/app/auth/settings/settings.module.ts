import { NgModule } from "@angular/core";

import { PasswordCalloutComponent } from "@bitwarden/auth";

import { SharedModule } from "../../shared";

import { ChangePasswordComponent } from "./change-password.component";
import { WebauthnLoginSettingsModule } from "./webauthn-login-settings";

@NgModule({
  imports: [SharedModule, WebauthnLoginSettingsModule, PasswordCalloutComponent],
  declarations: [ChangePasswordComponent],
  providers: [],
  exports: [ChangePasswordComponent],
})
export class AuthSettingsModule {}
