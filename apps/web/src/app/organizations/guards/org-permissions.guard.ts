import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { SyncService } from "@bitwarden/common/abstractions/sync.service";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { canAccessOrgAdmin } from "../navigation-permissions";

@Injectable({
  providedIn: "root",
})
export class OrganizationPermissionsGuard implements CanActivate {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private syncService: SyncService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // TODO: We need to fix this issue once and for all.
    if ((await this.syncService.getLastSync()) == null) {
      await this.syncService.fullSync(false);
    }

    const org = await this.organizationService.get(route.params.organizationId);
    if (org == null) {
      return this.router.createUrlTree(["/"]);
    }

    if (!org.isOwner && !org.enabled) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("organizationIsDisabled")
      );
      return this.router.createUrlTree(["/"]);
    }

    const permissionsCallback: (organization: Organization) => boolean =
      route.data?.organizationPermissions;
    const hasPermissions = permissionsCallback == null || permissionsCallback(org);

    if (!hasPermissions) {
      // Handle linkable ciphers for organizations the user only has view access to
      // https://bitwarden.atlassian.net/browse/EC-203
      const cipherId =
        state.root.queryParamMap.get("itemId") || state.root.queryParamMap.get("cipherId");
      if (cipherId) {
        return this.router.createUrlTree(["/vault"], {
          queryParams: {
            itemId: cipherId,
          },
        });
      }

      this.platformUtilsService.showToast("error", null, this.i18nService.t("accessDenied"));
      return canAccessOrgAdmin(org)
        ? this.router.createUrlTree(["/organizations", org.id])
        : this.router.createUrlTree(["/"]);
    }

    return true;
  }
}
