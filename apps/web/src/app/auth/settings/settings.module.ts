import { NgModule } from "@angular/core";

import { PasswordCalloutComponent } from "@bitwarden/auth/angular";

import { SharedModule } from "../../shared";
import { EmergencyAccessModule } from "../emergency-access";
import { UserKeyRotationModule } from "../key-rotation/user-key-rotation.module";

import { ChangePasswordComponent } from "./change-password.component";
import { WebauthnLoginSettingsModule } from "./webauthn-login-settings";

@NgModule({
  imports: [
    SharedModule,
    WebauthnLoginSettingsModule,
    EmergencyAccessModule,
    PasswordCalloutComponent,
    UserKeyRotationModule,
  ],
  declarations: [ChangePasswordComponent],
  providers: [],
  exports: [ChangePasswordComponent],
})
export class AuthSettingsModule {}
