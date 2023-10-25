import { NgModule } from "@angular/core";

import { CheckboxModule } from "@bitwarden/components";

import { SharedModule } from "../../../app/shared";

import { LoginDecryptionOptionsComponent } from "./login-decryption-options/login-decryption-options.component";
import { LoginViaAuthRequestComponent } from "./login-via-auth-request.component";
import { LoginComponent } from "./login.component";

@NgModule({
  imports: [SharedModule, CheckboxModule],
  declarations: [LoginComponent, LoginViaAuthRequestComponent, LoginDecryptionOptionsComponent],
  exports: [LoginComponent, LoginViaAuthRequestComponent, LoginDecryptionOptionsComponent],
})
export class LoginModule {}
