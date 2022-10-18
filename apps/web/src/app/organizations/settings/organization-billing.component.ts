import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PaymentMethodType } from "@bitwarden/common/enums/paymentMethodType";
import { TransactionType } from "@bitwarden/common/enums/transactionType";
import { VerifyBankRequest } from "@bitwarden/common/models/request/verify-bank.request";
import { BillingResponse } from "@bitwarden/common/models/response/billing.response";

@Component({
  selector: "app-org-billing",
  templateUrl: "./organization-billing.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class OrganizationBillingComponent implements OnInit {
  loading = false;
  firstLoaded = false;
  showAdjustPayment = false;
  showAddCredit = false;
  billing: BillingResponse;
  paymentMethodType = PaymentMethodType;
  transactionType = TransactionType;
  organizationId: string;
  verifyAmount1: number;
  verifyAmount2: number;

  verifyBankPromise: Promise<void>;

  // TODO - Make sure to properly split out the billing/invoice and payment method/account during org admin refresh

  constructor(
    private i18nService: I18nService,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
      this.firstLoaded = true;
    });
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    if (this.organizationId != null) {
      this.billing = await this.organizationApiService.getBilling(this.organizationId);
    }
    this.loading = false;
  }

  async verifyBank() {
    if (this.loading) {
      return;
    }

    try {
      const request = new VerifyBankRequest();
      request.amount1 = this.verifyAmount1;
      request.amount2 = this.verifyAmount2;
      this.verifyBankPromise = this.organizationApiService.verifyBank(this.organizationId, request);
      await this.verifyBankPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("verifiedBankAccount")
      );
      this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  addCredit() {
    if (this.paymentSourceInApp) {
      this.platformUtilsService.showDialog(
        this.i18nService.t("cannotPerformInAppPurchase"),
        this.i18nService.t("addCredit"),
        null,
        null,
        "warning"
      );
      return;
    }
    this.showAddCredit = true;
  }

  closeAddCredit(load: boolean) {
    this.showAddCredit = false;
    if (load) {
      this.load();
    }
  }

  changePayment() {
    if (this.paymentSourceInApp) {
      this.platformUtilsService.showDialog(
        this.i18nService.t("cannotPerformInAppPurchase"),
        this.i18nService.t("changePaymentMethod"),
        null,
        null,
        "warning"
      );
      return;
    }
    this.showAdjustPayment = true;
  }

  closePayment(load: boolean) {
    this.showAdjustPayment = false;
    if (load) {
      this.load();
    }
  }

  get isCreditBalance() {
    return this.billing == null || this.billing.balance <= 0;
  }

  get creditOrBalance() {
    return Math.abs(this.billing != null ? this.billing.balance : 0);
  }

  get paymentSource() {
    return this.billing != null ? this.billing.paymentSource : null;
  }

  get paymentSourceInApp() {
    return (
      this.paymentSource != null &&
      (this.paymentSource.type === PaymentMethodType.AppleInApp ||
        this.paymentSource.type === PaymentMethodType.GoogleInApp)
    );
  }

  get invoices() {
    return this.billing != null ? this.billing.invoices : null;
  }

  get transactions() {
    return this.billing != null ? this.billing.transactions : null;
  }
}
