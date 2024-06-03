import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { from, lastValueFrom, Subject, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { openAddAccountCreditDialog } from "@bitwarden/angular/billing/components";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions";
import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { MaskedPaymentMethod, TaxInformation } from "@bitwarden/common/billing/models/domain";
import { ExpandedTaxInfoUpdateRequest } from "@bitwarden/common/billing/models/request/expanded-tax-info-update.request";
import { VerifyBankAccountRequest } from "@bitwarden/common/billing/models/request/verify-bank-account.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

import {
  openProviderSelectPaymentMethodDialog,
  ProviderSelectPaymentMethodDialogResultType,
} from "./provider-select-payment-method-dialog.component";

@Component({
  selector: "app-provider-payment-method",
  templateUrl: "./provider-payment-method.component.html",
})
export class ProviderPaymentMethodComponent implements OnInit, OnDestroy {
  protected providerId: string;
  protected loading: boolean;

  protected accountCredit: number;
  protected maskedPaymentMethod: MaskedPaymentMethod;
  protected taxInformation: TaxInformation;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private billingApiService: BillingApiServiceAbstraction,
    private dialogService: DialogService,
    private i18nService: I18nService,
    private toastService: ToastService,
  ) {}

  addAccountCredit = () =>
    openAddAccountCreditDialog(this.dialogService, {
      data: {
        providerId: this.providerId,
      },
    });

  changePaymentMethod = async () => {
    const dialogRef = openProviderSelectPaymentMethodDialog(this.dialogService, {
      data: {
        providerId: this.providerId,
      },
    });

    const result = await lastValueFrom(dialogRef.closed);

    if (result == ProviderSelectPaymentMethodDialogResultType.Submitted) {
      await this.load();
    }
  };

  async load() {
    this.loading = true;
    const paymentInformation = await this.billingApiService.getProviderPaymentInformation(
      this.providerId,
    );
    this.accountCredit = paymentInformation.accountCredit;
    this.maskedPaymentMethod = MaskedPaymentMethod.from(paymentInformation.paymentMethod);
    this.taxInformation = TaxInformation.from(paymentInformation.taxInformation);
    this.loading = false;
  }

  onDataUpdated = async () => await this.load();

  updateTaxInformation = async (taxInformation: TaxInformation) => {
    const request = ExpandedTaxInfoUpdateRequest.From(taxInformation);
    await this.billingApiService.updateProviderTaxInformation(this.providerId, request);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("updatedTaxInformation"),
    });
  };

  verifyBankAccount = async (amount1: number, amount2: number) => {
    const request = new VerifyBankAccountRequest(amount1, amount2);
    await this.billingApiService.verifyProviderBankAccount(this.providerId, request);
  };

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        switchMap(({ providerId }) => {
          this.providerId = providerId;
          return from(this.load());
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected get hasPaymentMethod(): boolean {
    return !!this.maskedPaymentMethod;
  }

  protected get hasUnverifiedPaymentMethod(): boolean {
    return !!this.maskedPaymentMethod && this.maskedPaymentMethod.needsVerification;
  }

  protected get paymentMethodClass(): string[] {
    switch (this.maskedPaymentMethod.type) {
      case PaymentMethodType.Card:
        return ["bwi-credit-card"];
      case PaymentMethodType.BankAccount:
        return ["bwi-bank"];
      case PaymentMethodType.PayPal:
        return ["bwi-paypal tw-text-primary"];
      default:
        return [];
    }
  }

  protected get paymentMethodDescription(): string {
    let description = this.maskedPaymentMethod.description;
    if (this.maskedPaymentMethod.type === PaymentMethodType.BankAccount) {
      if (this.hasUnverifiedPaymentMethod) {
        description += " - " + this.i18nService.t("unverified");
      } else {
        description += " - " + this.i18nService.t("verified");
      }
    }
    return description;
  }
}
