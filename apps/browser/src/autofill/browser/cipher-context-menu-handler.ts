import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { Utils } from "@bitwarden/common/misc/utils";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherRepromptType } from "@bitwarden/common/vault/enums/cipher-reprompt-type";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import {
  authServiceFactory,
  AuthServiceInitOptions,
} from "../../background/service_factories/auth-service.factory";
import { CachedServices } from "../../background/service_factories/factory-options";
import { searchServiceFactory } from "../../background/service_factories/search-service.factory";
import { BrowserApi } from "../../browser/browserApi";
import { Account } from "../../models/account";
import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../vault/background/service_factories/cipher-service.factory";

import { MainContextMenuHandler } from "./main-context-menu-handler";

const NOT_IMPLEMENTED = (..._args: unknown[]) => Promise.resolve();

const LISTENED_TO_COMMANDS = [
  "loggedIn",
  "unlocked",
  "syncCompleted",
  "bgUpdateContextMenu",
  "editedCipher",
  "addedCipher",
  "deletedCipher",
];

export class CipherContextMenuHandler {
  constructor(
    private mainContextMenuHandler: MainContextMenuHandler,
    private authService: AuthService,
    private cipherService: CipherService
  ) {}

  static async create(cachedServices: CachedServices) {
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
        biometricCallback: () => Promise.resolve(false),
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
    return new CipherContextMenuHandler(
      await MainContextMenuHandler.mv3Create(cachedServices),
      await authServiceFactory(cachedServices, serviceOptions),
      await cipherServiceFactory(cachedServices, serviceOptions)
    );
  }

  static async tabsOnActivatedListener(
    activeInfo: chrome.tabs.TabActiveInfo,
    serviceCache: CachedServices
  ) {
    const cipherContextMenuHandler = await CipherContextMenuHandler.create(serviceCache);
    const tab = await BrowserApi.getTab(activeInfo.tabId);
    await cipherContextMenuHandler.update(tab.url);
  }

  static async tabsOnReplacedListener(
    addedTabId: number,
    removedTabId: number,
    serviceCache: CachedServices
  ) {
    const cipherContextMenuHandler = await CipherContextMenuHandler.create(serviceCache);
    const tab = await BrowserApi.getTab(addedTabId);
    await cipherContextMenuHandler.update(tab.url);
  }

  static async tabsOnUpdatedListener(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
    serviceCache: CachedServices
  ) {
    if (changeInfo.status !== "complete") {
      return;
    }
    const cipherContextMenuHandler = await CipherContextMenuHandler.create(serviceCache);
    await cipherContextMenuHandler.update(tab.url);
  }

  static async messageListener(
    message: { command: string },
    sender: chrome.runtime.MessageSender,
    cachedServices: CachedServices
  ) {
    if (!CipherContextMenuHandler.shouldListen(message)) {
      return;
    }
    const cipherContextMenuHandler = await CipherContextMenuHandler.create(cachedServices);
    await cipherContextMenuHandler.messageListener(message);
  }

  private static shouldListen(message: { command: string }) {
    return LISTENED_TO_COMMANDS.includes(message.command);
  }

  async messageListener(message: { command: string }, sender?: chrome.runtime.MessageSender) {
    if (!CipherContextMenuHandler.shouldListen(message)) {
      return;
    }

    const activeTabs = await BrowserApi.getActiveTabs();
    if (!activeTabs || activeTabs.length === 0) {
      return;
    }

    await this.update(activeTabs[0].url);
  }

  async update(url: string) {
    const authStatus = await this.authService.getAuthStatus();
    await MainContextMenuHandler.removeAll();
    if (authStatus !== AuthenticationStatus.Unlocked) {
      // Should I pass in the auth status or even have two seperate methods for this
      // on MainContextMenuHandler
      await this.mainContextMenuHandler.noAccess();
      return;
    }

    const menuEnabled = await this.mainContextMenuHandler.init();
    if (!menuEnabled) {
      return;
    }

    const ciphers = await this.cipherService.getAllDecryptedForUrl(url);
    ciphers.sort((a, b) => this.cipherService.sortCiphersByLastUsedThenName(a, b));

    if (ciphers.length === 0) {
      await this.mainContextMenuHandler.noLogins(url);
      return;
    }

    for (const cipher of ciphers) {
      await this.updateForCipher(url, cipher);
    }
  }

  private async updateForCipher(url: string, cipher: CipherView) {
    if (
      cipher == null ||
      cipher.type !== CipherType.Login ||
      cipher.reprompt !== CipherRepromptType.None
    ) {
      return;
    }

    let title = cipher.name;
    if (!Utils.isNullOrEmpty(title)) {
      title += ` (${cipher.login.username})`;
    }

    await this.mainContextMenuHandler.loadOptions(title, cipher.id, url, cipher);
  }
}
