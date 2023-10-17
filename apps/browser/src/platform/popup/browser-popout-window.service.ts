import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";

import { BrowserApi } from "../browser/browser-api";

import { BrowserPopoutWindowService as BrowserPopupWindowServiceInterface } from "./abstractions/browser-popout-window.service";

class BrowserPopoutWindowService implements BrowserPopupWindowServiceInterface {
  private singleActionPopoutTabIds: Record<string, number> = {};
  private defaultPopoutWindowOptions: chrome.windows.CreateData = {
    type: "popup",
    focused: true,
    width: 380,
    height: 630,
  };

  async openUnlockPrompt(senderWindowId: number) {
    await this.openSingleActionPopout(
      senderWindowId,
      "popup/index.html?uilocation=popout",
      "unlockPrompt"
    );
  }

  async closeUnlockPrompt() {
    await this.closeSingleActionPopout("unlockPrompt");
  }

  async openPasswordRepromptPrompt(
    senderWindowId: number,
    {
      cipherId,
      senderTabId,
      action,
    }: {
      cipherId: string;
      senderTabId: number;
      action: string;
    }
  ) {
    const promptWindowPath =
      "popup/index.html#/view-cipher" +
      "?uilocation=popout" +
      `&cipherId=${cipherId}` +
      `&senderTabId=${senderTabId}` +
      `&action=${action}`;

    await this.openSingleActionPopout(senderWindowId, promptWindowPath, "passwordReprompt");
  }

  async openCipherCreation(
    senderWindowId: number,
    {
      cipherType = CipherType.Login,
      senderTabId,
      senderTabURI,
    }: {
      cipherType?: CipherType;
      senderTabId: number;
      senderTabURI: string;
    }
  ) {
    const promptWindowPath =
      "popup/index.html#/edit-cipher" +
      "?uilocation=popout" +
      `&type=${cipherType}` +
      `&senderTabId=${senderTabId}` +
      `&uri=${senderTabURI}`;

    await this.openSingleActionPopout(senderWindowId, promptWindowPath, "cipherCreation");
  }

  async openCipherEdit(
    senderWindowId: number,
    {
      cipherId,
      senderTabId,
      senderTabURI,
    }: {
      cipherId: string;
      senderTabId: number;
      senderTabURI: string;
    }
  ) {
    const promptWindowPath =
      "popup/index.html#/edit-cipher" +
      "?uilocation=popout" +
      `&cipherId=${cipherId}` +
      `&senderTabId=${senderTabId}` +
      `&uri=${senderTabURI}`;

    await this.openSingleActionPopout(senderWindowId, promptWindowPath, "cipherEdit");
  }

  async closePasswordRepromptPrompt() {
    await this.closeSingleActionPopout("passwordReprompt");
  }

  async openFido2Popout(
    senderWindow: chrome.tabs.Tab,
    {
      sessionId,
      senderTabId,
      fallbackSupported,
    }: {
      sessionId: string;
      senderTabId: number;
      fallbackSupported: boolean;
    }
  ): Promise<number> {
    await this.closeFido2Popout();

    const promptWindowPath =
      "popup/index.html#/fido2" +
      "?uilocation=popout" +
      `&sessionId=${sessionId}` +
      `&fallbackSupported=${fallbackSupported}` +
      `&senderTabId=${senderTabId}` +
      `&senderUrl=${encodeURIComponent(senderWindow.url)}`;

    return await this.openSingleActionPopout(
      senderWindow.windowId,
      promptWindowPath,
      "fido2Popout",
      {
        width: 200,
        height: 500,
      }
    );
  }

  async closeFido2Popout(): Promise<void> {
    await this.closeSingleActionPopout("fido2Popout");
  }

  private async openSingleActionPopout(
    senderWindowId: number,
    popupWindowURL: string,
    singleActionPopoutKey: string,
    options: chrome.windows.CreateData = {}
  ): Promise<number> {
    const senderWindow = senderWindowId && (await BrowserApi.getWindow(senderWindowId));
    const url = chrome.extension.getURL(popupWindowURL);
    const offsetRight = 15;
    const offsetTop = 90;
    /// Use overrides in `options` if provided, otherwise use default
    const popupWidth = options?.width || this.defaultPopoutWindowOptions.width;
    const windowOptions = senderWindow
      ? {
          ...this.defaultPopoutWindowOptions,
          left: senderWindow.left + senderWindow.width - popupWidth - offsetRight,
          top: senderWindow.top + offsetTop,
          ...options,
          url,
        }
      : { ...this.defaultPopoutWindowOptions, url, ...options };

    const popupWindow = await BrowserApi.createWindow(windowOptions);

    await this.closeSingleActionPopout(singleActionPopoutKey);
    this.singleActionPopoutTabIds[singleActionPopoutKey] = popupWindow?.tabs[0].id;

    return popupWindow.id;
  }

  private async closeSingleActionPopout(popoutKey: string) {
    const tabId = this.singleActionPopoutTabIds[popoutKey];

    if (tabId) {
      await BrowserApi.removeTab(tabId);
    }
    this.singleActionPopoutTabIds[popoutKey] = null;
  }
}

export default BrowserPopoutWindowService;
