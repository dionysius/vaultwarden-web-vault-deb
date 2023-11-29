import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { ForceSetPasswordReason } from "@bitwarden/common/auth/models/domain/force-set-password-reason";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private messagingService: MessagingService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    const authStatus = await this.authService.getAuthStatus();

    if (authStatus === AuthenticationStatus.LoggedOut) {
      this.messagingService.send("authBlocked", { url: routerState.url });
      return false;
    }

    if (authStatus === AuthenticationStatus.Locked) {
      if (routerState != null) {
        this.messagingService.send("lockedUrl", { url: routerState.url });
      }
      return this.router.createUrlTree(["lock"], { queryParams: { promptBiometric: true } });
    }

    if (
      !routerState.url.includes("remove-password") &&
      (await this.keyConnectorService.getConvertAccountRequired())
    ) {
      return this.router.createUrlTree(["/remove-password"]);
    }

    const forceSetPasswordReason = await this.stateService.getForceSetPasswordReason();

    if (
      forceSetPasswordReason ===
        ForceSetPasswordReason.TdeUserWithoutPasswordHasPasswordResetPermission &&
      !routerState.url.includes("set-password")
    ) {
      return this.router.createUrlTree(["/set-password"]);
    }

    if (
      forceSetPasswordReason !== ForceSetPasswordReason.None &&
      !routerState.url.includes("update-temp-password")
    ) {
      return this.router.createUrlTree(["/update-temp-password"]);
    }

    return true;
  }
}
