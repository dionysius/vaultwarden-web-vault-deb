import { Component, Input } from "@angular/core";

import { PaymentMethodType, TransactionType } from "@bitwarden/common/billing/enums";
import { BillingHistoryResponse } from "@bitwarden/common/billing/models/response/billing-history.response";

@Component({
  selector: "app-billing-history",
  templateUrl: "billing-history.component.html",
})
export class BillingHistoryComponent {
  @Input()
  billing: BillingHistoryResponse;

  paymentMethodType = PaymentMethodType;
  transactionType = TransactionType;

  get invoices() {
    return this.billing != null ? this.billing.invoices : null;
  }

  get transactions() {
    return this.billing != null ? this.billing.transactions : null;
  }

  paymentMethodClasses(type: PaymentMethodType) {
    switch (type) {
      case PaymentMethodType.Card:
        return ["bwi-credit-card"];
      case PaymentMethodType.BankAccount:
      case PaymentMethodType.WireTransfer:
        return ["bwi-bank"];
      case PaymentMethodType.BitPay:
        return ["bwi-bitcoin text-warning"];
      case PaymentMethodType.PayPal:
        return ["bwi-paypal text-primary"];
      default:
        return [];
    }
  }
}
