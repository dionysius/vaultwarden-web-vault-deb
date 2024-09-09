import {
  BillingInvoiceResponse,
  BillingTransactionResponse,
} from "@bitwarden/common/billing/models/response/billing.response";

export class AccountBillingApiServiceAbstraction {
  getBillingInvoices: (id: string, startAfter?: string) => Promise<BillingInvoiceResponse[]>;
  getBillingTransactions: (
    id: string,
    startAfter?: string,
  ) => Promise<BillingTransactionResponse[]>;
}
