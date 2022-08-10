import AutofillPageDetails from "../models/autofillPageDetails";
import { AutofillService } from "../services/abstractions/autofill.service";

export class AutoFillActiveTabCommand {
  constructor(private autofillService: AutofillService) {}

  async doAutoFillActiveTabCommand(tab: chrome.tabs.Tab) {
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
