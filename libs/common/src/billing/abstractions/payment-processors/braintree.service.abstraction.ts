export abstract class BraintreeServiceAbstraction {
  /**
   * Utilizes the Braintree SDK to create a [Braintree drop-in]{@link https://braintree.github.io/braintree-web-drop-in/docs/current/Dropin.html} instance attached to the container ID specified as part of the {@link loadBraintree} method.
   */
  createDropin: () => void;

  /**
   * Loads the Bitwarden dropin.js script in the <head> element of the current page.
   * This script attaches the Braintree SDK to the window.
   * @param containerId - The ID of the HTML element where the Braintree drop-in will be loaded at.
   * @param autoCreateDropin - Specifies whether the Braintree drop-in should be created when dropin.js loads.
   */
  loadBraintree: (containerId: string, autoCreateDropin: boolean) => void;

  /**
   * Invokes the Braintree [requestPaymentMethod]{@link https://braintree.github.io/braintree-web-drop-in/docs/current/Dropin.html#requestPaymentMethod} method
   * in order to generate a payment method token using the active Braintree drop-in.
   */
  requestPaymentMethod: () => Promise<string>;

  /**
   * Removes the following elements from the <head> of the current page:
   * - The Bitwarden dropin.js script
   * - Any <script> elements that contain the word "paypal"
   * - The Braintree drop-in stylesheet
   */
  unloadBraintree: () => void;
}
