import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { ProviderService } from "@bitwarden/common/abstractions/provider.service";
import { Provider } from "@bitwarden/common/models/domain/provider";

@Injectable()
export class ProviderPermissionsGuard implements CanActivate {
  constructor(
    private providerService: ProviderService,
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const provider = await this.providerService.get(route.params.providerId);
    if (provider == null) {
      return this.router.createUrlTree(["/"]);
    }

    if (!provider.isProviderAdmin && !provider.enabled) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("providerIsDisabled"));
      return this.router.createUrlTree(["/"]);
    }

    const permissionsCallback: (provider: Provider) => boolean = route.data?.providerPermissions;
    const hasSpecifiedPermissions = permissionsCallback == null || permissionsCallback(provider);

    if (!hasSpecifiedPermissions) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("accessDenied"));
      return this.router.createUrlTree(["/providers", provider.id]);
    }

    return true;
  }
}
