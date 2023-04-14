import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";

@Injectable({
  providedIn: "root",
})
export class IsPaidOrgGuard implements CanActivate {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private platformUtilsService: PlatformUtilsService,
    private messagingService: MessagingService,
    private i18nService: I18nService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const org = this.organizationService.get(route.params.organizationId);

    if (org == null) {
      return this.router.createUrlTree(["/"]);
    }

    if (org.isFreeOrg) {
      // Users without billing permission can't access billing
      if (!org.canEditSubscription) {
        await this.platformUtilsService.showDialog(
          this.i18nService.t("notAvailableForFreeOrganization"),
          this.i18nService.t("upgradeOrganization"),
          this.i18nService.t("ok")
        );
        return false;
      } else {
        this.messagingService.send("upgradeOrganization", { organizationId: org.id });
      }
    }

    return !org.isFreeOrg;
  }
}
