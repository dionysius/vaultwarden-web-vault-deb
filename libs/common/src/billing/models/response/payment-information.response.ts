import { BaseResponse } from "../../../models/response/base.response";

import { MaskedPaymentMethodResponse } from "./masked-payment-method.response";
import { TaxInfoResponse } from "./tax-info.response";

export class PaymentInformationResponse extends BaseResponse {
  accountCredit: number;
  paymentMethod?: MaskedPaymentMethodResponse;
  taxInformation?: TaxInfoResponse;

  constructor(response: any) {
    super(response);
    this.accountCredit = this.getResponseProperty("AccountCredit");

    const paymentMethod = this.getResponseProperty("PaymentMethod");
    if (paymentMethod) {
      this.paymentMethod = new MaskedPaymentMethodResponse(paymentMethod);
    }

    const taxInformation = this.getResponseProperty("TaxInformation");
    if (taxInformation) {
      this.taxInformation = new TaxInfoResponse(taxInformation);
    }
  }
}
