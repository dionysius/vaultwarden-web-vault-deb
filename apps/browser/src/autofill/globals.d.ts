import { AutofillInit } from "./content/abstractions/autofill-init";
import ContentMessageHandler from "./content/content-message-handler";

declare global {
  interface Window {
    bitwardenAutofillInit?: AutofillInit;
    bitwardenContentMessageHandler?: ContentMessageHandler;
  }
}
