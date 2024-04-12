import { Injectable, inject } from "@angular/core";
import { CanActivate, CanActivateFn, Router, UrlTree } from "@angular/router";
import { Observable, map } from "rxjs";

import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

/**
 * @deprecated use unauthGuardFn function instead
 */
@Injectable()
export class UnauthGuard implements CanActivate {
  protected homepage = "vault";
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

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

type UnauthRoutes = {
  homepage: () => string;
  locked: string;
};

const defaultRoutes: UnauthRoutes = {
  homepage: () => "/vault",
  locked: "/lock",
};

function unauthGuard(routes: UnauthRoutes): Observable<boolean | UrlTree> {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.activeAccountStatus$.pipe(
    map((status) => {
      if (status == null || status === AuthenticationStatus.LoggedOut) {
        return true;
      } else if (status === AuthenticationStatus.Locked) {
        return router.createUrlTree([routes.locked]);
      } else {
        return router.createUrlTree([routes.homepage()]);
      }
    }),
  );
}

export function unauthGuardFn(overrides: Partial<UnauthRoutes> = {}): CanActivateFn {
  return () => unauthGuard({ ...defaultRoutes, ...overrides });
}
