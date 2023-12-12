import { BrowserApi } from "../../platform/browser/browser-api";

import Fido2Service from "./fido2.service";

describe("Fido2Service", () => {
  let fido2Service: Fido2Service;
  let tabMock: chrome.tabs.Tab;
  let sender: chrome.runtime.MessageSender;

  beforeEach(() => {
    fido2Service = new Fido2Service();
    tabMock = { id: 123, url: "https://bitwarden.com" } as chrome.tabs.Tab;
    sender = { tab: tabMock };
    jest.spyOn(BrowserApi, "executeScriptInTab").mockImplementation();
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("injectFido2ContentScripts", () => {
    const fido2ContentScript = "content/fido2/content-script.js";
    const defaultExecuteScriptOptions = { runAt: "document_start" };

    it("accepts an extension message sender and injects the fido2 scripts into the tab of the sender", async () => {
      await fido2Service.injectFido2ContentScripts(sender);

      expect(BrowserApi.executeScriptInTab).toHaveBeenCalledWith(tabMock.id, {
        file: fido2ContentScript,
        ...defaultExecuteScriptOptions,
      });
    });
  });
});
