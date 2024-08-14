import { EVENTS } from "@bitwarden/common/autofill/constants";

import AutofillPageDetails from "../models/autofill-page-details";
import AutofillScript from "../models/autofill-script";
import { CollectAutofillContentService } from "../services/collect-autofill-content.service";
import DomElementVisibilityService from "../services/dom-element-visibility.service";
import InsertAutofillContentService from "../services/insert-autofill-content.service";
import { elementIsInputElement, nodeIsFormElement, sendExtensionMessage } from "../utils";

(function (globalContext) {
  const domElementVisibilityService = new DomElementVisibilityService();
  const collectAutofillContentService = new CollectAutofillContentService(
    domElementVisibilityService,
  );
  const insertAutofillContentService = new InsertAutofillContentService(
    domElementVisibilityService,
    collectAutofillContentService,
  );
  const loginKeywords = [
    "login",
    "log in",
    "log-in",
    "signin",
    "sign in",
    "sign-in",
    "submit",
    "continue",
    "next",
  ];
  let autoSubmitLoginTimeout: number | NodeJS.Timeout;

  init();

  /**
   * Initializes the auto-submit workflow with a delay to ensure that all page content is loaded.
   */
  function init() {
    const triggerOnPageLoad = () => setAutoSubmitLoginTimeout(250);
    if (globalContext.document.readyState === "complete") {
      triggerOnPageLoad();
      return;
    }

    globalContext.document.addEventListener(EVENTS.DOMCONTENTLOADED, triggerOnPageLoad);
  }

  /**
   * Collects the autofill page details and triggers the auto-submit login workflow.
   * If no details are found, we exit the auto-submit workflow.
   */
  async function startAutoSubmitLoginWorkflow() {
    const pageDetails: AutofillPageDetails = await collectAutofillContentService.getPageDetails();
    if (!pageDetails?.fields.length) {
      endUpAutoSubmitLoginWorkflow();
      return;
    }

    chrome.runtime.onMessage.addListener(handleExtensionMessage);
    await sendExtensionMessage("triggerAutoSubmitLogin", { pageDetails });
  }

  /**
   * Ends the auto-submit login workflow.
   */
  function endUpAutoSubmitLoginWorkflow() {
    clearAutoSubmitLoginTimeout();
    updateIsFieldCurrentlyFilling(false);
  }

  /**
   * Handles the extension message used to trigger the auto-submit login action.
   *
   * @param command - The command to execute
   * @param fillScript - The autofill script to use
   * @param pageDetailsUrl - The URL of the page details
   */
  async function handleExtensionMessage({
    command,
    fillScript,
    pageDetailsUrl,
  }: {
    command: string;
    fillScript: AutofillScript;
    pageDetailsUrl: string;
  }) {
    if (
      command !== "triggerAutoSubmitLogin" ||
      (globalContext.document.defaultView || globalContext).location.href !== pageDetailsUrl
    ) {
      return;
    }

    await triggerAutoSubmitLogin(fillScript);
  }

  /**
   * Fills the fields set within the autofill script and triggers the auto-submit action. Will
   * also set up a subsequent auto-submit action to continue the workflow on any multistep
   * login forms.
   *
   * @param fillScript - The autofill script to use
   */
  async function triggerAutoSubmitLogin(fillScript: AutofillScript) {
    if (!fillScript?.autosubmit?.length) {
      endUpAutoSubmitLoginWorkflow();
      throw new Error("Unable to auto-submit form, no autosubmit reference found.");
    }

    updateIsFieldCurrentlyFilling(true);
    await insertAutofillContentService.fillForm(fillScript);
    setAutoSubmitLoginTimeout(400);
    triggerAutoSubmitOnForm(fillScript);
  }

  /**
   * Triggers the auto-submit action on the form element. Will attempt to click an existing
   * submit button, and if none are found, will attempt to submit the form directly. Note
   * only the first matching field will be used to trigger the submit action. We will not
   * attempt to trigger the submit action on multiple forms that might exist on a page.
   *
   * @param fillScript - The autofill script to use
   */
  function triggerAutoSubmitOnForm(fillScript: AutofillScript) {
    const formOpid = fillScript.autosubmit[0];

    if (formOpid === null) {
      triggerAutoSubmitOnFormlessFields(fillScript);
      return;
    }

    const formElement = getAutofillFormElementByOpid(formOpid);
    if (!formElement) {
      triggerAutoSubmitOnFormlessFields(fillScript);
      return;
    }

    if (submitElementFoundAndClicked(formElement)) {
      return;
    }

    if (formElement.requestSubmit) {
      formElement.requestSubmit();
      return;
    }

    formElement.submit();
  }

  /**
   * Triggers the auto-submit action on formless fields. This is done by iterating up the DOM
   * tree, and attempting to find a submit button or form element to trigger the submit action.
   *
   * @param fillScript - The autofill script to use
   */
  function triggerAutoSubmitOnFormlessFields(fillScript: AutofillScript) {
    let currentElement = collectAutofillContentService.getAutofillFieldElementByOpid(
      fillScript.script[fillScript.script.length - 1][1],
    );

    const lastFieldIsPasswordInput =
      elementIsInputElement(currentElement) && currentElement.type === "password";

    while (currentElement && currentElement.tagName !== "HTML") {
      if (submitElementFoundAndClicked(currentElement, lastFieldIsPasswordInput)) {
        return;
      }

      if (!currentElement.parentElement && currentElement.getRootNode() instanceof ShadowRoot) {
        currentElement = (currentElement.getRootNode() as ShadowRoot).host as any;
        continue;
      }

      currentElement = currentElement.parentElement;
    }

    if (!currentElement || currentElement.tagName === "HTML") {
      endUpAutoSubmitLoginWorkflow();
      throw new Error("Unable to auto-submit form, no submit button or form element found.");
    }
  }

  /**
   * Queries the element for an element of type="submit" or a button element with a keyword
   * that matches a login action. If found, the element is clicked and the submit action is
   * triggered.
   *
   * @param element - The element to query for a submit action
   * @param lastFieldIsPasswordInput - Whether the last field is a password input
   */
  function submitElementFoundAndClicked(
    element: HTMLElement,
    lastFieldIsPasswordInput = false,
  ): boolean {
    const genericSubmitElement = collectAutofillContentService.deepQueryElements<HTMLButtonElement>(
      element,
      "[type='submit']",
    );
    if (genericSubmitElement[0]) {
      clickSubmitElement(genericSubmitElement[0], lastFieldIsPasswordInput);
      return true;
    }

    const buttons = collectAutofillContentService.deepQueryElements<HTMLButtonElement>(
      element,
      "button",
    );
    for (let i = 0; i < buttons.length; i++) {
      if (isLoginButton(buttons[i])) {
        clickSubmitElement(buttons[i], lastFieldIsPasswordInput);
        return true;
      }
    }

    return false;
  }

  /**
   * Handles clicking the submit element and optionally triggering
   * a completion action for multistep login forms.
   *
   * @param element - The element to click
   * @param lastFieldIsPasswordInput - Whether the last field is a password input
   */
  function clickSubmitElement(element: HTMLElement, lastFieldIsPasswordInput = false) {
    if (lastFieldIsPasswordInput) {
      triggerMultiStepAutoSubmitLoginComplete();
    }

    element.click();
  }

  /**
   * Gathers attributes from the element and checks if any of the values match the login
   * keywords. This is used to determine if the element is a login button.
   *
   * @param element - The element to check
   */
  function isLoginButton(element: HTMLElement) {
    const keywordValues = [
      element.textContent,
      element.getAttribute("value"),
      element.getAttribute("aria-label"),
      element.getAttribute("aria-labelledby"),
      element.getAttribute("aria-describedby"),
      element.getAttribute("title"),
      element.getAttribute("id"),
      element.getAttribute("name"),
      element.getAttribute("class"),
    ]
      .join(",")
      .toLowerCase();

    return loginKeywords.some((keyword) => keywordValues.includes(keyword));
  }

  /**
   * Retrieves a form element by its opid attribute.
   *
   * @param opid - The opid to search for
   */
  function getAutofillFormElementByOpid(opid: string): HTMLFormElement | null {
    const cachedFormElements = Array.from(
      collectAutofillContentService.autofillFormElements.keys(),
    );
    const formElements = cachedFormElements?.length
      ? cachedFormElements
      : getAutofillFormElements();

    return formElements.find((formElement) => formElement.opid === opid) || null;
  }

  /**
   * Gets all form elements on the page.
   */
  function getAutofillFormElements(): HTMLFormElement[] {
    const formElements: HTMLFormElement[] = [];
    collectAutofillContentService.queryAllTreeWalkerNodes(
      globalContext.document.documentElement,
      (node: Node) => {
        if (nodeIsFormElement(node)) {
          formElements.push(node);
          return true;
        }

        return false;
      },
    );

    return formElements;
  }

  /**
   * Sets a timeout to trigger the auto-submit login workflow.
   *
   * @param delay - The delay to wait before triggering the workflow
   */
  function setAutoSubmitLoginTimeout(delay: number) {
    clearAutoSubmitLoginTimeout();
    autoSubmitLoginTimeout = globalContext.setTimeout(() => startAutoSubmitLoginWorkflow(), delay);
  }

  /**
   * Clears the auto-submit login timeout.
   */
  function clearAutoSubmitLoginTimeout() {
    if (autoSubmitLoginTimeout) {
      globalContext.clearInterval(autoSubmitLoginTimeout);
    }
  }

  /**
   * Triggers a completion action for multistep login forms.
   */
  function triggerMultiStepAutoSubmitLoginComplete() {
    endUpAutoSubmitLoginWorkflow();
    void sendExtensionMessage("multiStepAutoSubmitLoginComplete");
  }

  /**
   * Updates the state of whether a field is currently being filled. This ensures that
   * the inline menu is not displayed when a field is being filled.
   *
   * @param isFieldCurrentlyFilling - Whether a field is currently being filled
   */
  function updateIsFieldCurrentlyFilling(isFieldCurrentlyFilling: boolean) {
    void sendExtensionMessage("updateIsFieldCurrentlyFilling", { isFieldCurrentlyFilling });
  }
})(globalThis);
