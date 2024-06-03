import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { TokenizedPaymentMethod } from "@bitwarden/common/billing/models/domain";

export class TokenizedPaymentMethodRequest {
  type: PaymentMethodType;
  token: string;

  static From(tokenizedPaymentMethod: TokenizedPaymentMethod): TokenizedPaymentMethodRequest {
    const request = new TokenizedPaymentMethodRequest();
    request.type = tokenizedPaymentMethod.type;
    request.token = tokenizedPaymentMethod.token;
    return request;
  }
}
