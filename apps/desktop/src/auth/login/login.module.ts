import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { EnvironmentSelectorComponent } from "@bitwarden/angular/auth/components/environment-selector.component";

import { SharedModule } from "../../app/shared/shared.module";

import { LoginWithDeviceComponent } from "./login-with-device.component";
import { LoginComponent } from "./login.component";

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [LoginComponent, LoginWithDeviceComponent, EnvironmentSelectorComponent],
  exports: [LoginComponent, LoginWithDeviceComponent],
})
export class LoginModule {}
