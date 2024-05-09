import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

import { BrowserRouterService } from "../../platform/popup/services/browser-router.service";

/**
 * This guard verifies the user's authetication status.
 * If "Locked", it saves the intended route in memory and redirects to the lock screen. Otherwise, the intended route is allowed.
 */
export const fido2AuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const routerService = inject(BrowserRouterService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const authStatus = await authService.getAuthStatus();

  if (authStatus === AuthenticationStatus.Locked) {
    // Appending fromLock=true to the query params to indicate that the user is being redirected from the lock screen, this is used for user verification.
    const previousUrl = `${state.url}&fromLock=true`;
    routerService.setPreviousUrl(previousUrl);
    return router.createUrlTree(["/lock"], { queryParams: route.queryParams });
  }

  return true;
};
