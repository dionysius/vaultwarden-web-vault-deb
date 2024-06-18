import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { ProductTierType } from "@bitwarden/common/billing/enums";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { DialogService } from "@bitwarden/components";

@Injectable({
  providedIn: "root",
})
export class IsEnterpriseOrgGuard implements CanActivate {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private dialogService: DialogService,
    private configService: ConfigService,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isMemberAccessReportEnabled = await firstValueFrom(
      this.configService.getFeatureFlag$(FeatureFlag.MemberAccessReport),
    );

    // TODO: Remove on "MemberAccessReport" feature flag cleanup
    if (!isMemberAccessReportEnabled) {
      return this.router.createUrlTree(["/"]);
    }

    const org = await this.organizationService.get(route.params.organizationId);

    if (org == null) {
      return this.router.createUrlTree(["/"]);
    }

    if (org.productTierType != ProductTierType.Enterprise) {
      // Users without billing permission can't access billing
      if (!org.canEditSubscription) {
        await this.dialogService.openSimpleDialog({
          title: { key: "upgradeOrganizationEnterprise" },
          content: { key: "onlyAvailableForEnterpriseOrganization" },
          acceptButtonText: { key: "ok" },
          cancelButtonText: null,
          type: "info",
        });
        return false;
      } else {
        const upgradeConfirmed = await this.dialogService.openSimpleDialog({
          title: { key: "upgradeOrganizationEnterprise" },
          content: { key: "onlyAvailableForEnterpriseOrganization" },
          acceptButtonText: { key: "upgradeOrganization" },
          type: "info",
          icon: "bwi-arrow-circle-up",
        });
        if (upgradeConfirmed) {
          await this.router.navigate(["organizations", org.id, "billing", "subscription"], {
            queryParams: { upgrade: true },
          });
        }
      }
    }

    return org.productTierType == ProductTierType.Enterprise;
  }
}
