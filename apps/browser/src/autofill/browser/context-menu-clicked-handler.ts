import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { EventType } from "@bitwarden/common/enums/eventType";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherRepromptType } from "@bitwarden/common/vault/enums/cipher-reprompt-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import LockedVaultPendingNotificationsItem from "../../background/models/lockedVaultPendingNotificationsItem";
import {
  authServiceFactory,
  AuthServiceInitOptions,
} from "../../background/service_factories/auth-service.factory";
import { eventCollectionServiceFactory } from "../../background/service_factories/event-collection-service.factory";
import { CachedServices } from "../../background/service_factories/factory-options";
import { passwordGenerationServiceFactory } from "../../background/service_factories/password-generation-service.factory";
import { searchServiceFactory } from "../../background/service_factories/search-service.factory";
import { stateServiceFactory } from "../../background/service_factories/state-service.factory";
import { totpServiceFactory } from "../../background/service_factories/totp-service.factory";
import { BrowserApi } from "../../browser/browserApi";
import { Account } from "../../models/account";
import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../vault/background/service_factories/cipher-service.factory";
import { autofillServiceFactory } from "../background/service_factories/autofill-service.factory";
import { copyToClipboard, GeneratePasswordToClipboardCommand } from "../clipboard";
import { AutofillTabCommand } from "../commands/autofill-tab-command";

import {
  AUTOFILL_ID,
  COPY_IDENTIFIER_ID,
  COPY_PASSWORD_ID,
  COPY_USERNAME_ID,
  COPY_VERIFICATIONCODE_ID,
  GENERATE_PASSWORD_ID,
  NOOP_COMMAND_SUFFIX,
} from "./main-context-menu-handler";

export type CopyToClipboardOptions = { text: string; tab: chrome.tabs.Tab };
export type CopyToClipboardAction = (options: CopyToClipboardOptions) => void;

export type GeneratePasswordToClipboardAction = (tab: chrome.tabs.Tab) => Promise<void>;

const NOT_IMPLEMENTED = (..._args: unknown[]) =>
  Promise.reject<never>("This action is not implemented inside of a service worker context.");

export class ContextMenuClickedHandler {
  constructor(
    private copyToClipboard: CopyToClipboardAction,
    private generatePasswordToClipboard: GeneratePasswordToClipboardAction,
    private authService: AuthService,
    private cipherService: CipherService,
    private autofillTabCommand: AutofillTabCommand,
    private totpService: TotpService,
    private eventCollectionService: EventCollectionService
  ) {}

  static async mv3Create(cachedServices: CachedServices) {
    const stateFactory = new StateFactory(GlobalState, Account);
    let searchService: SearchService | null = null;
    const serviceOptions: AuthServiceInitOptions & CipherServiceInitOptions = {
      apiServiceOptions: {
        logoutCallback: NOT_IMPLEMENTED,
      },
      cipherServiceOptions: {
        searchServiceFactory: () => searchService,
      },
      cryptoFunctionServiceOptions: {
        win: self,
      },
      encryptServiceOptions: {
        logMacFailures: false,
      },
      i18nServiceOptions: {
        systemLanguage: chrome.i18n.getUILanguage(),
      },
      keyConnectorServiceOptions: {
        logoutCallback: NOT_IMPLEMENTED,
      },
      logServiceOptions: {
        isDev: false,
      },
      platformUtilsServiceOptions: {
        biometricCallback: NOT_IMPLEMENTED,
        clipboardWriteCallback: NOT_IMPLEMENTED,
        win: self,
      },
      stateMigrationServiceOptions: {
        stateFactory: stateFactory,
      },
      stateServiceOptions: {
        stateFactory: stateFactory,
      },
    };
    searchService = await searchServiceFactory(cachedServices, serviceOptions);

    const generatePasswordToClipboardCommand = new GeneratePasswordToClipboardCommand(
      await passwordGenerationServiceFactory(cachedServices, serviceOptions),
      await stateServiceFactory(cachedServices, serviceOptions)
    );

    return new ContextMenuClickedHandler(
      (options) => copyToClipboard(options.tab, options.text),
      (tab) => generatePasswordToClipboardCommand.generatePasswordToClipboard(tab),
      await authServiceFactory(cachedServices, serviceOptions),
      await cipherServiceFactory(cachedServices, serviceOptions),
      new AutofillTabCommand(await autofillServiceFactory(cachedServices, serviceOptions)),
      await totpServiceFactory(cachedServices, serviceOptions),
      await eventCollectionServiceFactory(cachedServices, serviceOptions)
    );
  }

  static async onClickedListener(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
    cachedServices: CachedServices = {}
  ) {
    const contextMenuClickedHandler = await ContextMenuClickedHandler.mv3Create(cachedServices);
    await contextMenuClickedHandler.run(info, tab);
  }

  static async messageListener(
    message: { command: string; data: LockedVaultPendingNotificationsItem },
    sender: chrome.runtime.MessageSender,
    cachedServices: CachedServices
  ) {
    if (
      message.command !== "unlockCompleted" ||
      message.data.target !== "contextmenus.background"
    ) {
      return;
    }

    const contextMenuClickedHandler = await ContextMenuClickedHandler.mv3Create(cachedServices);
    await contextMenuClickedHandler.run(
      message.data.commandToRetry.msg.data,
      message.data.commandToRetry.sender.tab
    );
  }

  async run(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
    switch (info.menuItemId) {
      case GENERATE_PASSWORD_ID:
        if (!tab) {
          return;
        }
        await this.generatePasswordToClipboard(tab);
        break;
      case COPY_IDENTIFIER_ID:
        if (!tab) {
          return;
        }
        this.copyToClipboard({ text: await this.getIdentifier(tab, info), tab: tab });
        break;
      default:
        await this.cipherAction(info, tab);
    }
  }

  async cipherAction(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
    if ((await this.authService.getAuthStatus()) < AuthenticationStatus.Unlocked) {
      const retryMessage: LockedVaultPendingNotificationsItem = {
        commandToRetry: {
          msg: { command: NOOP_COMMAND_SUFFIX, data: info },
          sender: { tab: tab },
        },
        target: "contextmenus.background",
      };
      await BrowserApi.tabSendMessageData(
        tab,
        "addToLockedVaultPendingNotifications",
        retryMessage
      );

      await BrowserApi.tabSendMessageData(tab, "promptForLogin");
      return;
    }

    // NOTE: We don't actually use the first part of this ID, we further switch based on the parentMenuItemId
    // I would really love to not add it but that is a departure from how it currently works.
    const id = (info.menuItemId as string).split("_")[1]; // We create all the ids, we can guarantee they are strings
    let cipher: CipherView | undefined;
    if (id === NOOP_COMMAND_SUFFIX) {
      // This NOOP item has come through which is generally only for no access state but since we got here
      // we are actually unlocked we will do our best to find a good match of an item to autofill this is useful
      // in scenarios like unlock on autofill
      const ciphers = await this.cipherService.getAllDecryptedForUrl(tab.url);
      cipher = ciphers.find((c) => c.reprompt === CipherRepromptType.None);
    } else {
      const ciphers = await this.cipherService.getAllDecrypted();
      cipher = ciphers.find((c) => c.id === id);
    }

    if (cipher == null) {
      return;
    }

    switch (info.parentMenuItemId) {
      case AUTOFILL_ID:
        if (tab == null) {
          return;
        }
        await this.autofillTabCommand.doAutofillTabWithCipherCommand(tab, cipher);
        break;
      case COPY_USERNAME_ID:
        this.copyToClipboard({ text: cipher.login.username, tab: tab });
        break;
      case COPY_PASSWORD_ID:
        this.copyToClipboard({ text: cipher.login.password, tab: tab });
        this.eventCollectionService.collect(EventType.Cipher_ClientCopiedPassword, cipher.id);
        break;
      case COPY_VERIFICATIONCODE_ID:
        this.copyToClipboard({ text: await this.totpService.getCode(cipher.login.totp), tab: tab });
        break;
    }
  }

  private async getIdentifier(tab: chrome.tabs.Tab, info: chrome.contextMenus.OnClickData) {
    return new Promise<string>((resolve, reject) => {
      BrowserApi.sendTabsMessage(
        tab.id,
        { command: "getClickedElement" },
        { frameId: info.frameId },
        (identifier: string) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }

          resolve(identifier);
        }
      );
    });
  }
}
