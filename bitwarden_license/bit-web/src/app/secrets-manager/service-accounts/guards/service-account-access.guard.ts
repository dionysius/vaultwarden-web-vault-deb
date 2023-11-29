import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from "@angular/router";

import { ServiceAccountService } from "../service-account.service";

/**
 * Redirects to service accounts page if the user doesn't have access to service account.
 */
export const serviceAccountAccessGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const serviceAccountService = inject(ServiceAccountService);

  try {
    const serviceAccount = await serviceAccountService.getByServiceAccountId(
      route.params.serviceAccountId,
      route.params.organizationId,
    );
    if (serviceAccount) {
      return true;
    }
  } catch {
    return createUrlTreeFromSnapshot(route, [
      "/sm",
      route.params.organizationId,
      "service-accounts",
    ]);
  }
  return createUrlTreeFromSnapshot(route, ["/sm", route.params.organizationId, "service-accounts"]);
};
