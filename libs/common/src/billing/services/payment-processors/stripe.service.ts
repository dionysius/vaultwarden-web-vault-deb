import { LogService } from "../../../platform/abstractions/log.service";
import { StripeServiceAbstraction } from "../../abstractions";
import { BankAccount } from "../../models/domain";

export class StripeService implements StripeServiceAbstraction {
  private stripe: any;
  private elements: any;
  private elementIds: {
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
  };

  constructor(private logService: LogService) {}

  loadStripe(
    elementIds: { cardNumber: string; cardExpiry: string; cardCvc: string },
    autoMount: boolean,
  ) {
    this.elementIds = elementIds;
    const script = window.document.createElement("script");
    script.id = "stripe-script";
    script.src = "https://js.stripe.com/v3?advancedFraudSignals=false";
    script.onload = () => {
      const window$ = window as any;
      this.stripe = window$.Stripe(process.env.STRIPE_KEY);
      this.elements = this.stripe.elements();
      const options = this.getElementOptions();
      setTimeout(() => {
        this.elements.create("cardNumber", options);
        this.elements.create("cardExpiry", options);
        this.elements.create("cardCvc", options);
        if (autoMount) {
          this.mountElements();
        }
      }, 50);
    };

    window.document.head.appendChild(script);
  }

  mountElements() {
    setTimeout(() => {
      const cardNumber = this.elements.getElement("cardNumber");
      const cardExpiry = this.elements.getElement("cardExpiry");
      const cardCvc = this.elements.getElement("cardCvc");
      cardNumber.mount(this.elementIds.cardNumber);
      cardExpiry.mount(this.elementIds.cardExpiry);
      cardCvc.mount(this.elementIds.cardCvc);
    });
  }

  async setupBankAccountPaymentMethod(
    clientSecret: string,
    { accountHolderName, routingNumber, accountNumber, accountHolderType }: BankAccount,
  ): Promise<string> {
    const result = await this.stripe.confirmUsBankAccountSetup(clientSecret, {
      payment_method: {
        us_bank_account: {
          routing_number: routingNumber,
          account_number: accountNumber,
          account_holder_type: accountHolderType,
        },
        billing_details: {
          name: accountHolderName,
        },
      },
    });
    if (result.error || (result.setupIntent && result.setupIntent.status !== "requires_action")) {
      this.logService.error(result.error);
      throw result.error;
    }
    return result.setupIntent.payment_method as string;
  }

  async setupCardPaymentMethod(clientSecret: string): Promise<string> {
    const cardNumber = this.elements.getElement("cardNumber");
    const result = await this.stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardNumber,
      },
    });
    if (result.error || (result.setupIntent && result.setupIntent.status !== "succeeded")) {
      this.logService.error(result.error);
      throw result.error;
    }
    return result.setupIntent.payment_method as string;
  }

  unloadStripe() {
    const script = window.document.getElementById("stripe-script");
    window.document.head.removeChild(script);
    window.setTimeout(() => {
      const iFrames = Array.from(window.document.querySelectorAll("iframe")).filter(
        (element) => element.src != null && element.src.indexOf("stripe") > -1,
      );
      iFrames.forEach((iFrame) => {
        try {
          window.document.body.removeChild(iFrame);
        } catch (error) {
          this.logService.error(error);
        }
      });
    }, 500);
  }

  private getElementOptions(): any {
    const options: any = {
      style: {
        base: {
          color: null,
          fontFamily:
            '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif, ' +
            '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          fontSize: "14px",
          fontSmoothing: "antialiased",
          "::placeholder": {
            color: null,
          },
        },
        invalid: {
          color: null,
        },
      },
      classes: {
        focus: "is-focused",
        empty: "is-empty",
        invalid: "is-invalid",
      },
    };

    const style = getComputedStyle(document.documentElement);
    options.style.base.color = `rgb(${style.getPropertyValue("--color-text-main")})`;
    options.style.base["::placeholder"].color = `rgb(${style.getPropertyValue(
      "--color-text-muted",
    )})`;
    options.style.invalid.color = `rgb(${style.getPropertyValue("--color-text-main")})`;
    options.style.invalid.borderColor = `rgb(${style.getPropertyValue("--color-danger-600")})`;

    return options;
  }
}
