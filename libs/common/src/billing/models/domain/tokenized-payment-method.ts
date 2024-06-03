import { PaymentMethodType } from "@bitwarden/common/billing/enums";

export type TokenizedPaymentMethod = {
  type: PaymentMethodType;
  token: string;
};
