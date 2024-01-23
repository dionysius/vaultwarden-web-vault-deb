import { map, Observable } from "rxjs";

import {
  ActiveUserState,
  BILLING_BANNERS_DISK,
  KeyDefinition,
  StateProvider,
} from "../../platform/state";
import { BillingBannerServiceAbstraction } from "../abstractions/billing-banner.service.abstraction";

const PAYMENT_METHOD_BANNERS_KEY = KeyDefinition.record<boolean>(
  BILLING_BANNERS_DISK,
  "paymentMethodBanners",
  {
    deserializer: (b) => b,
  },
);

export class BillingBannerService implements BillingBannerServiceAbstraction {
  private paymentMethodBannerStates: ActiveUserState<Record<string, boolean>>;
  paymentMethodBannerStates$: Observable<{ organizationId: string; visible: boolean }[]>;

  constructor(private stateProvider: StateProvider) {
    this.paymentMethodBannerStates = this.stateProvider.getActive(PAYMENT_METHOD_BANNERS_KEY);
    this.paymentMethodBannerStates$ = this.paymentMethodBannerStates.state$.pipe(
      map((billingBannerStates) =>
        !billingBannerStates
          ? []
          : Object.entries(billingBannerStates).map(([organizationId, visible]) => ({
              organizationId,
              visible,
            })),
      ),
    );
  }

  async setPaymentMethodBannerState(organizationId: string, visibility: boolean): Promise<void> {
    await this.paymentMethodBannerStates.update((states) => {
      states ??= {};
      states[organizationId] = visibility;
      return states;
    });
  }
}
