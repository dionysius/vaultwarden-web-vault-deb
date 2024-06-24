import { map, Observable, OperatorFunction, switchMap } from "rxjs";

import { ProviderStatusType } from "@bitwarden/common/admin-console/enums";
import { Provider } from "@bitwarden/common/admin-console/models/domain/provider";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

type MaybeProvider = Provider | undefined;

export const hasConsolidatedBilling = (
  configService: ConfigService,
): OperatorFunction<MaybeProvider, boolean> =>
  switchMap<MaybeProvider, Observable<boolean>>((provider) =>
    configService
      .getFeatureFlag$(FeatureFlag.EnableConsolidatedBilling)
      .pipe(
        map((consolidatedBillingEnabled) =>
          provider
            ? provider.providerStatus === ProviderStatusType.Billable && consolidatedBillingEnabled
            : false,
        ),
      ),
  );
