import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { DialogServiceAbstraction, SimpleDialogType } from "@bitwarden/angular/services/dialog";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";

@Injectable({
  providedIn: "root",
})
export class IsPaidOrgGuard implements CanActivate {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private messagingService: MessagingService,
    private dialogService: DialogServiceAbstraction
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const org = this.organizationService.get(route.params.organizationId);

    if (org == null) {
      return this.router.createUrlTree(["/"]);
    }

    if (org.isFreeOrg) {
      // Users without billing permission can't access billing
      if (!org.canEditSubscription) {
        await this.dialogService.openSimpleDialog({
          title: { key: "upgradeOrganization" },
          content: { key: "notAvailableForFreeOrganization" },
          acceptButtonText: { key: "ok" },
          cancelButtonText: null,
          type: SimpleDialogType.INFO,
        });
        return false;
      } else {
        this.messagingService.send("upgradeOrganization", { organizationId: org.id });
      }
    }

    return !org.isFreeOrg;
  }
}
