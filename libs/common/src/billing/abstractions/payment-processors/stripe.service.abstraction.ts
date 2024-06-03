import { BankAccount } from "@bitwarden/common/billing/models/domain";

export abstract class StripeServiceAbstraction {
  /**
   * Loads [Stripe JS]{@link https://docs.stripe.com/js} in the <head> element of the current page and mounts
   * Stripe credit card [elements]{@link https://docs.stripe.com/js/elements_object/create} into the HTML elements with the provided element IDS.
   * We do this to avoid having to load the Stripe JS SDK on every page of the Web Vault given many pages contain sensitive information.
   * @param elementIds - The ID attributes of the HTML elements used to load the Stripe JS credit card elements.
   */
  loadStripe: (
    elementIds: { cardNumber: string; cardExpiry: string; cardCvc: string },
    autoMount: boolean,
  ) => void;

  /**
   * Re-mounts previously created Stripe credit card [elements]{@link https://docs.stripe.com/js/elements_object/create} into the HTML elements
   * specified during the {@link loadStripe} call. This is useful for when those HTML elements are removed from the DOM by Angular.
   */
  mountElements: () => void;

  /**
   * Creates a Stripe [SetupIntent]{@link https://docs.stripe.com/api/setup_intents} and uses the resulting client secret
   * to invoke the Stripe JS [confirmUsBankAccountSetup]{@link https://docs.stripe.com/js/setup_intents/confirm_us_bank_account_setup} method,
   * thereby creating and storing a Stripe [PaymentMethod]{@link https://docs.stripe.com/api/payment_methods}.
   * @returns The ID of the newly created PaymentMethod.
   */
  setupBankAccountPaymentMethod: (
    clientSecret: string,
    bankAccount: BankAccount,
  ) => Promise<string>;

  /**
   * Creates a Stripe [SetupIntent]{@link https://docs.stripe.com/api/setup_intents} and uses the resulting client secret
   * to invoke the Stripe JS [confirmCardSetup]{@link https://docs.stripe.com/js/setup_intents/confirm_card_setup} method,
   * thereby creating and storing a Stripe [PaymentMethod]{@link https://docs.stripe.com/api/payment_methods}.
   * @returns The ID of the newly created PaymentMethod.
   */
  setupCardPaymentMethod: (clientSecret: string) => Promise<string>;

  /**
   * Removes {@link https://docs.stripe.com/js} from the <head> element of the current page as well as all
   * Stripe-managed <iframe> elements.
   */
  unloadStripe: () => void;
}
