import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AccountBillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/account-billing-api.service.abstraction";
import {
  BillingInvoiceResponse,
  BillingTransactionResponse,
} from "@bitwarden/common/billing/models/response/billing.response";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  templateUrl: "billing-history-view.component.html",
})
export class BillingHistoryViewComponent implements OnInit {
  loading = false;
  firstLoaded = false;
  invoices: BillingInvoiceResponse[] = [];
  transactions: BillingTransactionResponse[] = [];
  hasAdditionalHistory: boolean = false;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private router: Router,
    private accountBillingApiService: AccountBillingApiServiceAbstraction,
  ) {}

  async ngOnInit() {
    if (this.platformUtilsService.isSelfHost()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["/settings/subscription"]);
      return;
    }
    await this.load();
    this.firstLoaded = true;
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;

    const invoicesPromise = this.accountBillingApiService.getBillingInvoices(
      this.invoices.length > 0 ? this.invoices[this.invoices.length - 1].id : null,
    );

    const transactionsPromise = this.accountBillingApiService.getBillingTransactions(
      this.transactions.length > 0
        ? this.transactions[this.transactions.length - 1].createdDate
        : null,
    );

    const accountInvoices = await invoicesPromise;
    const accountTransactions = await transactionsPromise;
    const pageSize = 5;

    this.invoices = [...this.invoices, ...accountInvoices];
    this.transactions = [...this.transactions, ...accountTransactions];
    this.hasAdditionalHistory = !(
      accountInvoices.length < pageSize && accountTransactions.length < pageSize
    );

    this.loading = false;
  }
}
