import { NotificationsService } from "@bitwarden/common/abstractions/notifications.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { SystemService } from "@bitwarden/common/platform/abstractions/system.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { CipherType } from "@bitwarden/common/vault/enums";

import {
  closeUnlockPopout,
  openSsoAuthResultPopout,
  openTwoFactorAuthPopout,
} from "../auth/popup/utils/auth-popout-window";
import LockedVaultPendingNotificationsItem from "../autofill/notification/models/locked-vault-pending-notifications-item";
import { AutofillService } from "../autofill/services/abstractions/autofill.service";
import { BrowserApi } from "../platform/browser/browser-api";
import { BrowserStateService } from "../platform/services/abstractions/browser-state.service";
import { BrowserEnvironmentService } from "../platform/services/browser-environment.service";
import BrowserPlatformUtilsService from "../platform/services/browser-platform-utils.service";
import { AbortManager } from "../vault/background/abort-manager";
import { Fido2Service } from "../vault/services/abstractions/fido2.service";

import MainBackground from "./main.background";

export default class RuntimeBackground {
  private autofillTimeout: any;
  private pageDetailsToAutoFill: any[] = [];
  private onInstalledReason: string = null;
  private lockedVaultPendingNotifications: LockedVaultPendingNotificationsItem[] = [];
  private abortManager = new AbortManager();

  constructor(
    private main: MainBackground,
    private autofillService: AutofillService,
    private platformUtilsService: BrowserPlatformUtilsService,
    private i18nService: I18nService,
    private notificationsService: NotificationsService,
    private stateService: BrowserStateService,
    private systemService: SystemService,
    private environmentService: BrowserEnvironmentService,
    private messagingService: MessagingService,
    private logService: LogService,
    private configService: ConfigServiceAbstraction,
    private fido2Service: Fido2Service,
  ) {
    // onInstalled listener must be wired up before anything else, so we do it in the ctor
    chrome.runtime.onInstalled.addListener((details: any) => {
      this.onInstalledReason = details.reason;
    });
  }

  async init() {
    if (!chrome.runtime) {
      return;
    }

    await this.checkOnInstalled();
    const backgroundMessageListener = (
      msg: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: any,
    ) => {
      const messagesWithResponse = [
        "checkFido2FeatureEnabled",
        "fido2RegisterCredentialRequest",
        "fido2GetCredentialRequest",
      ];

      if (messagesWithResponse.includes(msg.command)) {
        this.processMessage(msg, sender).then(
          (value) => sendResponse({ result: value }),
          (error) => sendResponse({ error: { ...error, message: error.message } }),
        );
        return true;
      }

      this.processMessage(msg, sender);
      return false;
    };

    BrowserApi.messageListener("runtime.background", backgroundMessageListener);
    if (this.main.popupOnlyContext) {
      (window as any).bitwardenBackgroundMessageListener = backgroundMessageListener;
    }
  }

  async processMessage(msg: any, sender: chrome.runtime.MessageSender) {
    switch (msg.command) {
      case "loggedIn":
      case "unlocked": {
        let item: LockedVaultPendingNotificationsItem;

        if (this.lockedVaultPendingNotifications?.length > 0) {
          item = this.lockedVaultPendingNotifications.pop();
          await closeUnlockPopout();
        }

        await this.main.refreshBadge();
        await this.main.refreshMenu(false);
        this.notificationsService.updateConnection(msg.command === "unlocked");
        this.systemService.cancelProcessReload();

        if (item) {
          await BrowserApi.focusWindow(item.commandToRetry.sender.tab.windowId);
          await BrowserApi.focusTab(item.commandToRetry.sender.tab.id);
          await BrowserApi.tabSendMessageData(
            item.commandToRetry.sender.tab,
            "unlockCompleted",
            item,
          );
        }
        break;
      }
      case "addToLockedVaultPendingNotifications":
        this.lockedVaultPendingNotifications.push(msg.data);
        break;
      case "logout":
        await this.main.logout(msg.expired, msg.userId);
        break;
      case "syncCompleted":
        if (msg.successfully) {
          setTimeout(async () => {
            await this.main.refreshBadge();
            await this.main.refreshMenu();
          }, 2000);
          this.main.avatarUpdateService.loadColorFromState();
          this.configService.triggerServerConfigFetch();
        }
        break;
      case "openPopup":
        await this.main.openPopup();
        break;
      case "triggerAutofillScriptInjection":
        await this.autofillService.injectAutofillScripts(
          sender,
          await this.configService.getFeatureFlag<boolean>(FeatureFlag.AutofillV2),
          await this.configService.getFeatureFlag<boolean>(FeatureFlag.AutofillOverlay),
        );
        break;
      case "bgCollectPageDetails":
        await this.main.collectPageDetailsForContentScript(sender.tab, msg.sender, sender.frameId);
        break;
      case "bgUpdateContextMenu":
      case "editedCipher":
      case "addedCipher":
      case "deletedCipher":
        await this.main.refreshBadge();
        await this.main.refreshMenu();
        break;
      case "bgReseedStorage":
        await this.main.reseedStorage();
        break;
      case "collectPageDetailsResponse":
        switch (msg.sender) {
          case "autofiller":
          case "autofill_cmd": {
            this.stateService.setLastActive(new Date().getTime());
            const totpCode = await this.autofillService.doAutoFillActiveTab(
              [
                {
                  frameId: sender.frameId,
                  tab: msg.tab,
                  details: msg.details,
                },
              ],
              msg.sender === "autofill_cmd",
            );
            if (totpCode != null) {
              this.platformUtilsService.copyToClipboard(totpCode, { window: window });
            }
            break;
          }
          case "autofill_card": {
            await this.autofillService.doAutoFillActiveTab(
              [
                {
                  frameId: sender.frameId,
                  tab: msg.tab,
                  details: msg.details,
                },
              ],
              false,
              CipherType.Card,
            );
            break;
          }
          case "autofill_identity": {
            await this.autofillService.doAutoFillActiveTab(
              [
                {
                  frameId: sender.frameId,
                  tab: msg.tab,
                  details: msg.details,
                },
              ],
              false,
              CipherType.Identity,
            );
            break;
          }
          case "contextMenu":
            clearTimeout(this.autofillTimeout);
            this.pageDetailsToAutoFill.push({
              frameId: sender.frameId,
              tab: msg.tab,
              details: msg.details,
            });
            this.autofillTimeout = setTimeout(async () => await this.autofillPage(msg.tab), 300);
            break;
          default:
            break;
        }
        break;
      case "authResult": {
        const vaultUrl = this.environmentService.getWebVaultUrl();

        if (msg.referrer == null || Utils.getHostname(vaultUrl) !== msg.referrer) {
          return;
        }

        if (msg.lastpass) {
          this.messagingService.send("importCallbackLastPass", {
            code: msg.code,
            state: msg.state,
          });
        } else {
          try {
            await openSsoAuthResultPopout(msg);
          } catch {
            this.logService.error("Unable to open sso popout tab");
          }
        }
        break;
      }
      case "webAuthnResult": {
        const vaultUrl = this.environmentService.getWebVaultUrl();

        if (msg.referrer == null || Utils.getHostname(vaultUrl) !== msg.referrer) {
          return;
        }

        await openTwoFactorAuthPopout(msg);
        break;
      }
      case "reloadPopup":
        this.messagingService.send("reloadPopup");
        break;
      case "emailVerificationRequired":
        this.messagingService.send("showDialog", {
          title: { key: "emailVerificationRequired" },
          content: { key: "emailVerificationRequiredDesc" },
          acceptButtonText: { key: "ok" },
          cancelButtonText: null,
          type: "info",
        });
        break;
      case "getClickedElementResponse":
        this.platformUtilsService.copyToClipboard(msg.identifier, { window: window });
        break;
      case "triggerFido2ContentScriptInjection":
        await this.fido2Service.injectFido2ContentScripts(sender);
        break;
      case "fido2AbortRequest":
        this.abortManager.abort(msg.abortedRequestId);
        break;
      case "checkFido2FeatureEnabled":
        return await this.main.fido2ClientService.isFido2FeatureEnabled();
      case "fido2RegisterCredentialRequest":
        return await this.abortManager.runWithAbortController(
          msg.requestId,
          async (abortController) => {
            try {
              return await this.main.fido2ClientService.createCredential(
                msg.data,
                sender.tab,
                abortController,
              );
            } finally {
              await BrowserApi.focusTab(sender.tab.id);
              await BrowserApi.focusWindow(sender.tab.windowId);
            }
          },
        );
      case "fido2GetCredentialRequest":
        return await this.abortManager.runWithAbortController(
          msg.requestId,
          async (abortController) => {
            try {
              return await this.main.fido2ClientService.assertCredential(
                msg.data,
                sender.tab,
                abortController,
              );
            } finally {
              await BrowserApi.focusTab(sender.tab.id);
              await BrowserApi.focusWindow(sender.tab.windowId);
            }
          },
        );
      case "switchAccount": {
        await this.main.switchAccount(msg.userId);
      }
    }
  }

  private async autofillPage(tabToAutoFill: chrome.tabs.Tab) {
    const totpCode = await this.autofillService.doAutoFill({
      tab: tabToAutoFill,
      cipher: this.main.loginToAutoFill,
      pageDetails: this.pageDetailsToAutoFill,
      fillNewPassword: true,
      allowTotpAutofill: true,
    });

    if (totpCode != null) {
      this.platformUtilsService.copyToClipboard(totpCode, { window: window });
    }

    // reset
    this.main.loginToAutoFill = null;
    this.pageDetailsToAutoFill = [];
  }

  private async checkOnInstalled() {
    setTimeout(async () => {
      if (this.onInstalledReason != null) {
        if (this.onInstalledReason === "install") {
          BrowserApi.createNewTab("https://bitwarden.com/browser-start/");

          if (await this.environmentService.hasManagedEnvironment()) {
            await this.environmentService.setUrlsToManagedEnvironment();
          }
        }

        this.onInstalledReason = null;
      }
    }, 100);
  }
}
