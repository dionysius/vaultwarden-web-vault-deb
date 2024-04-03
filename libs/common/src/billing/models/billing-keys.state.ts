import { BILLING_DISK, UserKeyDefinition } from "../../platform/state";
import { PaymentMethodWarning } from "../models/domain/payment-method-warning";

export const PAYMENT_METHOD_WARNINGS_KEY = UserKeyDefinition.record<PaymentMethodWarning>(
  BILLING_DISK,
  "paymentMethodWarnings",
  {
    deserializer: (warnings) => ({
      ...warnings,
      savedAt: new Date(warnings.savedAt),
    }),
    clearOn: ["logout"],
  },
);
