import { PaymentMethodType } from "../../enums";

import { ExpandedTaxInfoUpdateRequest } from "./expanded-tax-info-update.request";

export class PaymentRequest extends ExpandedTaxInfoUpdateRequest {
  paymentMethodType: PaymentMethodType;
  paymentToken: string;
}
