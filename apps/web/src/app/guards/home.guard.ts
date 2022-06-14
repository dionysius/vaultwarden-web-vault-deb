import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";

@Injectable()
export class HomeGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const authStatus = await this.authService.getAuthStatus();

    if (authStatus === AuthenticationStatus.LoggedOut) {
      return this.router.createUrlTree(["/login"], { queryParams: route.queryParams });
    }
    if (authStatus === AuthenticationStatus.Locked) {
      return this.router.createUrlTree(["/lock"], { queryParams: route.queryParams });
    }
    return this.router.createUrlTree(["/vault"], { queryParams: route.queryParams });
  }
}
