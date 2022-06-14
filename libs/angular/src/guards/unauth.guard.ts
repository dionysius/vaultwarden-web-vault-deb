import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";

@Injectable()
export class UnauthGuard implements CanActivate {
  protected homepage = "vault";
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate() {
    const authStatus = await this.authService.getAuthStatus();

    if (authStatus === AuthenticationStatus.LoggedOut) {
      return true;
    }

    if (authStatus === AuthenticationStatus.Locked) {
      return this.router.createUrlTree(["lock"]);
    }

    return this.router.createUrlTree([this.homepage]);
  }
}
