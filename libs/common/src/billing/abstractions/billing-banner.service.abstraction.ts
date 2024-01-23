import { Observable } from "rxjs";

export class BillingBannerServiceAbstraction {
  paymentMethodBannerStates$: Observable<{ organizationId: string; visible: boolean }[]>;
  setPaymentMethodBannerState: (organizationId: string, visible: boolean) => Promise<void>;
}
