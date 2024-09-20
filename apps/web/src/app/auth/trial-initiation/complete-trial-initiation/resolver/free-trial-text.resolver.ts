import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";

import { ProductType } from "@bitwarden/common/billing/enums";

export const freeTrialTextResolver: ResolveFn<string | null> = (
  route: ActivatedRouteSnapshot,
): string | null => {
  const { product } = route.queryParams;
  const products: ProductType[] = (product ?? "").split(",").map((p: string) => parseInt(p));

  const onlyPasswordManager = products.length === 1 && products[0] === ProductType.PasswordManager;
  const onlySecretsManager = products.length === 1 && products[0] === ProductType.SecretsManager;

  switch (true) {
    case onlyPasswordManager:
      return "continueSettingUpFreeTrialPasswordManager";
    case onlySecretsManager:
      return "continueSettingUpFreeTrialSecretsManager";
    default:
      return "continueSettingUpFreeTrial";
  }
};
