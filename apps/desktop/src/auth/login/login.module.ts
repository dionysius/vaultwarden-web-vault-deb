import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { EnvironmentSelectorComponent } from "@bitwarden/angular/auth/components/environment-selector.component";

import { SharedModule } from "../../app/shared/shared.module";

import { LoginDecryptionOptionsComponent } from "./login-decryption-options/login-decryption-options.component";
import { LoginViaAuthRequestComponent } from "./login-via-auth-request.component";
import { LoginComponent } from "./login.component";

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [
    LoginComponent,
    LoginViaAuthRequestComponent,
    EnvironmentSelectorComponent,
    LoginDecryptionOptionsComponent,
  ],
  exports: [LoginComponent, LoginViaAuthRequestComponent],
})
export class LoginModule {}
