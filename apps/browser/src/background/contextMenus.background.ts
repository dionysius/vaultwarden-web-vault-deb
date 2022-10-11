import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { EventService } from "@bitwarden/common/abstractions/event.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { CipherRepromptType } from "@bitwarden/common/enums/cipherRepromptType";
import { EventType } from "@bitwarden/common/enums/eventType";
import { CipherView } from "@bitwarden/common/models/view/cipherView";

import { BrowserApi } from "../browser/browserApi";

import MainBackground from "./main.background";
import LockedVaultPendingNotificationsItem from "./models/lockedVaultPendingNotificationsItem";

export default class ContextMenusBackground {
  private readonly noopCommandSuffix = "noop";
  private contextMenus: any;

  constructor(
    private main: MainBackground,
    private cipherService: CipherService,
    private passwordGenerationService: PasswordGenerationService,
    private platformUtilsService: PlatformUtilsService,
    private authService: AuthService,
    private eventService: EventService,
    private totpService: TotpService
  ) {
    this.contextMenus = chrome.contextMenus;
  }

  async init() {
    if (!this.contextMenus) {
      return;
    }

    this.contextMenus.onClicked.addListener(
      async (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
        if (info.menuItemId === "generate-password") {
          await this.generatePasswordToClipboard();
        } else if (info.menuItemId === "copy-identifier") {
          await this.getClickedElement(tab, info.frameId);
        } else if (
          info.parentMenuItemId === "autofill" ||
          info.parentMenuItemId === "copy-username" ||
          info.parentMenuItemId === "copy-password" ||
          info.parentMenuItemId === "copy-totp"
        ) {
          await this.cipherAction(tab, info);
        }
      }
    );

    BrowserApi.messageListener(
      "contextmenus.background",
      async (msg: any, sender: chrome.runtime.MessageSender, sendResponse: any) => {
        if (msg.command === "unlockCompleted" && msg.data.target === "contextmenus.background") {
          await this.cipherAction(
            msg.data.commandToRetry.sender.tab,
            msg.data.commandToRetry.msg.data
          );
        }
      }
    );
  }

  private async generatePasswordToClipboard() {
    const options = (await this.passwordGenerationService.getOptions())?.[0] ?? {};
    const password = await this.passwordGenerationService.generatePassword(options);
    this.platformUtilsService.copyToClipboard(password, { window: window });
    this.passwordGenerationService.addHistory(password);
  }

  private async getClickedElement(tab: chrome.tabs.Tab, frameId: number) {
    if (tab == null) {
      return;
    }

    BrowserApi.tabSendMessage(tab, { command: "getClickedElement" }, { frameId: frameId });
  }

  private async cipherAction(tab: chrome.tabs.Tab, info: chrome.contextMenus.OnClickData) {
    if (typeof info.menuItemId !== "string") {
      return;
    }

    const id = info.menuItemId.split("_")[1];

    if ((await this.authService.getAuthStatus()) < AuthenticationStatus.Unlocked) {
      const retryMessage: LockedVaultPendingNotificationsItem = {
        commandToRetry: {
          msg: { command: this.noopCommandSuffix, data: info },
          sender: { tab: tab },
        },
        target: "contextmenus.background",
      };
      await BrowserApi.tabSendMessageData(
        tab,
        "addToLockedVaultPendingNotifications",
        retryMessage
      );

      BrowserApi.tabSendMessageData(tab, "promptForLogin");
      return;
    }

    let cipher: CipherView;
    if (id === this.noopCommandSuffix) {
      const ciphers = await this.cipherService.getAllDecryptedForUrl(tab.url);
      cipher = ciphers.find((c) => c.reprompt === CipherRepromptType.None);
    } else {
      const ciphers = await this.cipherService.getAllDecrypted();
      cipher = ciphers.find((c) => c.id === id);
    }

    if (cipher == null) {
      return;
    }

    if (info.parentMenuItemId === "autofill") {
      await this.startAutofillPage(tab, cipher);
    } else if (info.parentMenuItemId === "copy-username") {
      this.platformUtilsService.copyToClipboard(cipher.login.username, { window: window });
    } else if (info.parentMenuItemId === "copy-password") {
      this.platformUtilsService.copyToClipboard(cipher.login.password, { window: window });
      this.eventService.collect(EventType.Cipher_ClientCopiedPassword, cipher.id);
    } else if (info.parentMenuItemId === "copy-totp") {
      const totpValue = await this.totpService.getCode(cipher.login.totp);
      this.platformUtilsService.copyToClipboard(totpValue, { window: window });
    }
  }

  private async startAutofillPage(tab: chrome.tabs.Tab, cipher: CipherView) {
    this.main.loginToAutoFill = cipher;
    if (tab == null) {
      return;
    }

    BrowserApi.tabSendMessage(tab, {
      command: "collectPageDetails",
      tab: tab,
      sender: "contextMenu",
    });
  }
}
