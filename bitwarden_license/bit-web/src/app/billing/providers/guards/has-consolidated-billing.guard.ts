import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { ProviderStatusType } from "@bitwarden/common/admin-console/enums";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

export const hasConsolidatedBilling: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const configService = inject(ConfigService);
  const providerService = inject(ProviderService);

  const provider = await firstValueFrom(providerService.get$(route.params.providerId));

  const consolidatedBillingEnabled = await configService.getFeatureFlag(
    FeatureFlag.EnableConsolidatedBilling,
  );

  if (
    !consolidatedBillingEnabled ||
    !provider ||
    provider.providerStatus !== ProviderStatusType.Billable
  ) {
    return createUrlTreeFromSnapshot(route, ["/providers", route.params.providerId]);
  }

  return true;
};
