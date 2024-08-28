import { ExpandedTaxInfoUpdateRequest } from "@bitwarden/common/billing/models/request/expanded-tax-info-update.request";
import { TokenizedPaymentSourceRequest } from "@bitwarden/common/billing/models/request/tokenized-payment-source.request";

export class UpdatePaymentMethodRequest {
  paymentSource: TokenizedPaymentSourceRequest;
  taxInformation: ExpandedTaxInfoUpdateRequest;
}
