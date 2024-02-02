import { BrowserApi } from "../../platform/browser/browser-api";

import { Fido2Service as Fido2ServiceInterface } from "./abstractions/fido2.service";

export default class Fido2Service implements Fido2ServiceInterface {
  async init() {
    const tabs = await BrowserApi.tabsQuery({});
    tabs.forEach((tab) => {
      if (tab.url?.startsWith("https")) {
        // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.injectFido2ContentScripts({ tab } as chrome.runtime.MessageSender);
      }
    });

    BrowserApi.addListener(chrome.runtime.onConnect, (port) => {
      if (port.name === "fido2ContentScriptReady") {
        port.postMessage({ command: "fido2ContentScriptInit" });
      }
    });
  }

  /**
   * Injects the FIDO2 content script into the current tab.
   * @param {chrome.runtime.MessageSender}  sender
   * @returns {Promise<void>}
   */
  async injectFido2ContentScripts(sender: chrome.runtime.MessageSender): Promise<void> {
    await BrowserApi.executeScriptInTab(sender.tab.id, {
      file: "content/fido2/content-script.js",
      frameId: sender.frameId,
      runAt: "document_start",
    });
  }
}
