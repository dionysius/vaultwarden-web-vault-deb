import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import {
  BillingApiServiceAbstraction,
  BraintreeServiceAbstraction,
  StripeServiceAbstraction,
} from "@bitwarden/common/billing/abstractions";
import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { TokenizedPaymentMethod } from "@bitwarden/common/billing/models/domain";

@Component({
  selector: "app-select-payment-method",
  templateUrl: "./select-payment-method.component.html",
})
export class SelectPaymentMethodComponent implements OnInit, OnDestroy {
  @Input() protected showAccountCredit: boolean = true;
  @Input() protected showBankAccount: boolean = true;
  @Input() protected showPayPal: boolean = true;
  @Input() private startWith: PaymentMethodType = PaymentMethodType.Card;
  @Input() protected onSubmit: (tokenizedPaymentMethod: TokenizedPaymentMethod) => Promise<void>;

  private destroy$ = new Subject<void>();

  protected formGroup = this.formBuilder.group({
    paymentMethod: [this.startWith],
    bankInformation: this.formBuilder.group({
      routingNumber: ["", [Validators.required]],
      accountNumber: ["", [Validators.required]],
      accountHolderName: ["", [Validators.required]],
      accountHolderType: ["", [Validators.required]],
    }),
  });
  protected PaymentMethodType = PaymentMethodType;

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    private braintreeService: BraintreeServiceAbstraction,
    private formBuilder: FormBuilder,
    private stripeService: StripeServiceAbstraction,
  ) {}

  async tokenizePaymentMethod(): Promise<TokenizedPaymentMethod> {
    const type = this.selected;

    if (this.usingStripe) {
      const clientSecret = await this.billingApiService.createSetupIntent(type);

      if (this.usingBankAccount) {
        const token = await this.stripeService.setupBankAccountPaymentMethod(clientSecret, {
          accountHolderName: this.formGroup.value.bankInformation.accountHolderName,
          routingNumber: this.formGroup.value.bankInformation.routingNumber,
          accountNumber: this.formGroup.value.bankInformation.accountNumber,
          accountHolderType: this.formGroup.value.bankInformation.accountHolderType,
        });
        return {
          type,
          token,
        };
      }

      if (this.usingCard) {
        const token = await this.stripeService.setupCardPaymentMethod(clientSecret);
        return {
          type,
          token,
        };
      }
    }

    if (this.usingPayPal) {
      const token = await this.braintreeService.requestPaymentMethod();
      return {
        type,
        token,
      };
    }

    return null;
  }

  submit = async () => {
    const tokenizedPaymentMethod = await this.tokenizePaymentMethod();
    await this.onSubmit(tokenizedPaymentMethod);
  };

  ngOnInit(): void {
    this.stripeService.loadStripe(
      {
        cardNumber: "#stripe-card-number",
        cardExpiry: "#stripe-card-expiry",
        cardCvc: "#stripe-card-cvc",
      },
      this.startWith === PaymentMethodType.Card,
    );

    if (this.showPayPal) {
      this.braintreeService.loadBraintree(
        "#braintree-container",
        this.startWith === PaymentMethodType.PayPal,
      );
    }

    this.formGroup
      .get("paymentMethod")
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.onPaymentMethodChange(type);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stripeService.unloadStripe();
    if (this.showPayPal) {
      this.braintreeService.unloadBraintree();
    }
  }

  private onPaymentMethodChange(type: PaymentMethodType): void {
    switch (type) {
      case PaymentMethodType.Card: {
        this.stripeService.mountElements();
        break;
      }
      case PaymentMethodType.PayPal: {
        this.braintreeService.createDropin();
        break;
      }
    }
  }

  private get selected(): PaymentMethodType {
    return this.formGroup.value.paymentMethod;
  }

  protected get usingAccountCredit(): boolean {
    return this.selected === PaymentMethodType.Credit;
  }

  protected get usingBankAccount(): boolean {
    return this.selected === PaymentMethodType.BankAccount;
  }

  protected get usingCard(): boolean {
    return this.selected === PaymentMethodType.Card;
  }

  protected get usingPayPal(): boolean {
    return this.selected === PaymentMethodType.PayPal;
  }

  private get usingStripe(): boolean {
    return this.usingBankAccount || this.usingCard;
  }
}
