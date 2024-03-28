import { Component } from "@angular/core";

import { LoginViaAuthRequestComponent as BaseLoginWithDeviceComponent } from "@bitwarden/angular/auth/components/login-via-auth-request.component";

@Component({
  selector: "app-login-via-auth-request",
  templateUrl: "login-via-auth-request.component.html",
})
export class LoginViaAuthRequestComponent extends BaseLoginWithDeviceComponent {}
