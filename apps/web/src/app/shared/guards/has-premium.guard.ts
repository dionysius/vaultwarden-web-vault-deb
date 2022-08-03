import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";

import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

@Injectable({
  providedIn: "root",
})
export class HasPremiumGuard implements CanActivate {
  constructor(
    private router: Router,
    private stateService: StateService,
    private messagingService: MessagingService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    const userHasPremium = await this.stateService.getCanAccessPremium();

    if (!userHasPremium) {
      this.messagingService.send("premiumRequired");
    }

    // Prevent trapping the user on the login page, since that's an awful UX flow
    if (!userHasPremium && this.router.url === "/login") {
      return this.router.createUrlTree(["/"]);
    }

    return userHasPremium;
  }
}
