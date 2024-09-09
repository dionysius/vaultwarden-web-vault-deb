import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil } from "rxjs";

import { OrganizationBillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/organizations/organization-billing-api.service.abstraction";
import {
  BillingInvoiceResponse,
  BillingTransactionResponse,
} from "@bitwarden/common/billing/models/response/billing.response";

@Component({
  templateUrl: "organization-billing-history-view.component.html",
})
export class OrgBillingHistoryViewComponent implements OnInit, OnDestroy {
  loading = false;
  firstLoaded = false;
  invoices: BillingInvoiceResponse[] = [];
  transactions: BillingTransactionResponse[] = [];
  organizationId: string;
  hasAdditionalHistory: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private organizationBillingApiService: OrganizationBillingApiServiceAbstraction,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.organizationId = params.organizationId;
          await this.load();
          this.firstLoaded = true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    const invoicesPromise = this.organizationBillingApiService.getBillingInvoices(
      this.organizationId,
      this.invoices.length > 0 ? this.invoices[this.invoices.length - 1].id : null,
    );

    const transactionsPromise = this.organizationBillingApiService.getBillingTransactions(
      this.organizationId,
      this.transactions.length > 0
        ? this.transactions[this.transactions.length - 1].createdDate
        : null,
    );

    const invoices = await invoicesPromise;
    const transactions = await transactionsPromise;
    const pageSize = 5;

    this.invoices = [...this.invoices, ...invoices];
    this.transactions = [...this.transactions, ...transactions];
    this.hasAdditionalHistory = !(invoices.length < pageSize && transactions.length < pageSize);
    this.loading = false;
  }
}
