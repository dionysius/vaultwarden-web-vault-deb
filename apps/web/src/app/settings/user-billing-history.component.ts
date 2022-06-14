import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PaymentMethodType } from "@bitwarden/common/enums/paymentMethodType";
import { TransactionType } from "@bitwarden/common/enums/transactionType";
import { BillingHistoryResponse } from "@bitwarden/common/models/response/billingHistoryResponse";

@Component({
  selector: "app-user-billing",
  templateUrl: "user-billing-history.component.html",
})
export class UserBillingHistoryComponent implements OnInit {
  loading = false;
  firstLoaded = false;
  billing: BillingHistoryResponse;
  paymentMethodType = PaymentMethodType;
  transactionType = TransactionType;

  constructor(
    protected apiService: ApiService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.platformUtilsService.isSelfHost()) {
      this.router.navigate(["/settings/subscription"]);
    }
    await this.load();
    this.firstLoaded = true;
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.billing = await this.apiService.getUserBillingHistory();
    this.loading = false;
  }

  get invoices() {
    return this.billing != null ? this.billing.invoices : null;
  }

  get transactions() {
    return this.billing != null ? this.billing.transactions : null;
  }
}
