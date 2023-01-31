import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import AutofillPageDetails from "../models/autofill-page-details";
import { AutofillService } from "../services/abstractions/autofill.service";

export class AutofillTabCommand {
  constructor(private autofillService: AutofillService) {}

  async doAutofillTabCommand(tab: chrome.tabs.Tab) {
    if (!tab.id) {
      throw new Error("Tab does not have an id, cannot complete autofill.");
    }

    const details = await this.collectPageDetails(tab.id);
    await this.autofillService.doAutoFillOnTab(
      [
        {
          frameId: 0,
          tab: tab,
          details: details,
        },
      ],
      tab,
      true
    );
  }

  async doAutofillTabWithCipherCommand(tab: chrome.tabs.Tab, cipher: CipherView) {
    if (!tab.id) {
      throw new Error("Tab does not have an id, cannot complete autofill.");
    }

    const details = await this.collectPageDetails(tab.id);
    await this.autofillService.doAutoFill({
      tab: tab,
      cipher: cipher,
      pageDetails: [
        {
          frameId: 0,
          tab: tab,
          details: details,
        },
      ],
      skipLastUsed: false,
      skipUsernameOnlyFill: false,
      onlyEmptyFields: false,
      onlyVisibleFields: false,
      fillNewPassword: true,
    });
  }

  private async collectPageDetails(tabId: number): Promise<AutofillPageDetails> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tabId,
        {
          command: "collectPageDetailsImmediately",
        },
        (response: AutofillPageDetails) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }

          resolve(response);
        }
      );
    });
  }
}
