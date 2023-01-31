import { BrowserApi } from "../../browser/browserApi";

/**
 * Copies text to the clipboard in a MV3 safe way.
 * @param tab - The tab that the text will be sent to so that it can be copied to the users clipboard this needs to be an active tab or the DOM won't be able to be used to do the action. The tab sent in here should be from a user started action or queried for active tabs.
 * @param text - The text that you want added to the users clipboard.
 */
export const copyToClipboard = async (tab: chrome.tabs.Tab, text: string) => {
  if (tab.id == null) {
    throw new Error("Cannot copy text to clipboard with a tab that does not have an id.");
  }

  BrowserApi.sendTabsMessage(tab.id, {
    command: "copyText",
    text: text,
  });
};
