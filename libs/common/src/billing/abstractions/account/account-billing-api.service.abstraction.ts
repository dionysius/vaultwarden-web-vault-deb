import {
  BillingInvoiceResponse,
  BillingTransactionResponse,
} from "@bitwarden/common/billing/models/response/billing.response";

export class AccountBillingApiServiceAbstraction {
  getBillingInvoices: (status?: string, startAfter?: string) => Promise<BillingInvoiceResponse[]>;
  getBillingTransactions: (startAfter?: string) => Promise<BillingTransactionResponse[]>;
}
