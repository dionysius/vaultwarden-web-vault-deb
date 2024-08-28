import { PaymentMethodType } from "@bitwarden/common/billing/enums";

export class TokenizedPaymentSourceRequest {
  type: PaymentMethodType;
  token: string;
}
