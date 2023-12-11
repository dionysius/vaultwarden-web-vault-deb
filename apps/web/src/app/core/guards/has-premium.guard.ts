import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateFn,
} from "@angular/router";

import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

/**
 * CanActivate guard that checks if the user has premium and otherwise triggers the "premiumRequired"
 * message and blocks navigation.
 */
export function hasPremiumGuard(): CanActivateFn {
  return async (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const router = inject(Router);
    const stateService = inject(StateService);
    const messagingService = inject(MessagingService);

    const userHasPremium = await stateService.getCanAccessPremium();

    if (!userHasPremium) {
      messagingService.send("premiumRequired");
    }

    // Prevent trapping the user on the login page, since that's an awful UX flow
    if (!userHasPremium && router.url === "/login") {
      return router.createUrlTree(["/"]);
    }

    return userHasPremium;
  };
}
