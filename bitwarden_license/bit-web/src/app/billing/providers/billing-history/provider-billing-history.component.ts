import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Subject, takeUntil } from "rxjs";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions";
import { InvoiceResponse } from "@bitwarden/common/billing/models/response/invoices.response";

@Component({
  templateUrl: "./provider-billing-history.component.html",
})
export class ProviderBillingHistoryComponent implements OnInit, OnDestroy {
  private providerId: string;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private billingApiService: BillingApiServiceAbstraction,
    private datePipe: DatePipe,
  ) {}

  getClientInvoiceReport = (invoiceId: string) =>
    this.billingApiService.getProviderClientInvoiceReport(this.providerId, invoiceId);

  getClientInvoiceReportName = (invoice: InvoiceResponse) => {
    const date = this.datePipe.transform(invoice.date, "yyyyMMdd");
    return `bitwarden_provider-billing-history_${date}_${invoice.number}`;
  };

  getInvoices = async () => await this.billingApiService.getProviderInvoices(this.providerId);

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        map(({ providerId }) => {
          this.providerId = providerId;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
