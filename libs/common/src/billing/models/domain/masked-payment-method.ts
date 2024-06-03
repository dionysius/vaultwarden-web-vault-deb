import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { MaskedPaymentMethodResponse } from "@bitwarden/common/billing/models/response/masked-payment-method.response";

export class MaskedPaymentMethod {
  type: PaymentMethodType;
  description: string;
  needsVerification: boolean;

  static from(response: MaskedPaymentMethodResponse | undefined) {
    if (response === undefined) {
      return null;
    }
    return {
      ...response,
    };
  }
}
