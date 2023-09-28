import { NgModule } from "@angular/core";

import { PasswordCalloutComponent } from "@bitwarden/auth";

import { SharedModule } from "../../shared";

import { RegisterFormComponent } from "./register-form.component";

@NgModule({
  imports: [SharedModule, PasswordCalloutComponent],
  declarations: [RegisterFormComponent],
  exports: [RegisterFormComponent],
})
export class RegisterFormModule {}
