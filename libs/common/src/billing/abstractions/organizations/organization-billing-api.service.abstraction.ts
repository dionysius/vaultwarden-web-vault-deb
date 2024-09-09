import {
  BillingInvoiceResponse,
  BillingTransactionResponse,
} from "@bitwarden/common/billing/models/response/billing.response";

export class OrganizationBillingApiServiceAbstraction {
  getBillingInvoices: (id: string, startAfter?: string) => Promise<BillingInvoiceResponse[]>;
  getBillingTransactions: (
    id: string,
    startAfter?: string,
  ) => Promise<BillingTransactionResponse[]>;
}
