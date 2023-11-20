import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { StateFactory } from "@bitwarden/common/platform/factories/state-factory";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { GlobalState } from "@bitwarden/common/platform/models/domain/global-state";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { Account } from "../../models/account";
import { CachedServices } from "../../platform/background/service-factories/factory-options";
import {
  i18nServiceFactory,
  I18nServiceInitOptions,
} from "../../platform/background/service-factories/i18n-service.factory";
import {
  logServiceFactory,
  LogServiceInitOptions,
} from "../../platform/background/service-factories/log-service.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../platform/background/service-factories/state-service.factory";
import { BrowserStateService } from "../../platform/services/abstractions/browser-state.service";
import {
  AUTOFILL_CARD_ID,
  AUTOFILL_ID,
  AUTOFILL_IDENTITY_ID,
  COPY_IDENTIFIER_ID,
  COPY_PASSWORD_ID,
  COPY_USERNAME_ID,
  COPY_VERIFICATION_CODE_ID,
  CREATE_CARD_ID,
  CREATE_IDENTITY_ID,
  CREATE_LOGIN_ID,
  GENERATE_PASSWORD_ID,
  NOOP_COMMAND_SUFFIX,
  ROOT_ID,
  SEPARATOR_ID,
} from "../constants";

export class MainContextMenuHandler {
  private initRunning = false;

  create: (options: chrome.contextMenus.CreateProperties) => Promise<void>;

  constructor(
    private stateService: BrowserStateService,
    private i18nService: I18nService,
    private logService: LogService
  ) {
    if (chrome.contextMenus) {
      this.create = (options) => {
        return new Promise<void>((resolve, reject) => {
          chrome.contextMenus.create(options, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            resolve();
          });
        });
      };
    } else {
      this.create = (_options) => Promise.resolve();
    }
  }

  static async mv3Create(cachedServices: CachedServices) {
    const stateFactory = new StateFactory(GlobalState, Account);
    const serviceOptions: StateServiceInitOptions & I18nServiceInitOptions & LogServiceInitOptions =
      {
        cryptoFunctionServiceOptions: {
          win: self,
        },
        encryptServiceOptions: {
          logMacFailures: false,
        },
        i18nServiceOptions: {
          systemLanguage: chrome.i18n.getUILanguage(),
        },
        logServiceOptions: {
          isDev: false,
        },
        stateServiceOptions: {
          stateFactory: stateFactory,
        },
      };

    return new MainContextMenuHandler(
      await stateServiceFactory(cachedServices, serviceOptions),
      await i18nServiceFactory(cachedServices, serviceOptions),
      await logServiceFactory(cachedServices, serviceOptions)
    );
  }

  /**
   *
   * @returns a boolean showing whether or not items were created
   */
  async init(): Promise<boolean> {
    const menuDisabled = await this.stateService.getDisableContextMenuItem();
    if (menuDisabled) {
      await MainContextMenuHandler.removeAll();
      return false;
    }

    if (this.initRunning) {
      return true;
    }
    this.initRunning = true;

    try {
      const create = async (options: Omit<chrome.contextMenus.CreateProperties, "contexts">) => {
        await this.create({ ...options, contexts: ["all"] });
      };

      await create({
        id: ROOT_ID,
        title: "Bitwarden",
      });

      await create({
        id: AUTOFILL_ID,
        parentId: ROOT_ID,
        title: this.i18nService.t("autoFillLogin"),
      });

      await create({
        id: COPY_USERNAME_ID,
        parentId: ROOT_ID,
        title: this.i18nService.t("copyUsername"),
      });

      await create({
        id: COPY_PASSWORD_ID,
        parentId: ROOT_ID,
        title: this.i18nService.t("copyPassword"),
      });

      if (await this.stateService.getCanAccessPremium()) {
        await create({
          id: COPY_VERIFICATION_CODE_ID,
          parentId: ROOT_ID,
          title: this.i18nService.t("copyVerificationCode"),
        });
      }

      await create({
        id: SEPARATOR_ID + 1,
        type: "separator",
        parentId: ROOT_ID,
      });

      await create({
        id: AUTOFILL_IDENTITY_ID,
        parentId: ROOT_ID,
        title: this.i18nService.t("autoFillIdentity"),
      });

      await create({
        id: AUTOFILL_CARD_ID,
        parentId: ROOT_ID,
        title: this.i18nService.t("autoFillCard"),
      });

      await create({
        id: SEPARATOR_ID + 2,
        type: "separator",
        parentId: ROOT_ID,
      });

      await create({
        id: GENERATE_PASSWORD_ID,
        parentId: ROOT_ID,
        title: this.i18nService.t("generatePasswordCopied"),
      });

      await create({
        id: COPY_IDENTIFIER_ID,
        parentId: ROOT_ID,
        title: this.i18nService.t("copyElementIdentifier"),
      });
    } catch (error) {
      this.logService.warning(error.message);
    } finally {
      this.initRunning = false;
    }
    return true;
  }

  static async removeAll() {
    return new Promise<void>((resolve, reject) => {
      chrome.contextMenus.removeAll(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        resolve();
      });
    });
  }

  static remove(menuItemId: string) {
    return new Promise<void>((resolve, reject) => {
      chrome.contextMenus.remove(menuItemId, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        resolve();
      });
    });
  }

  async loadOptions(title: string, optionId: string, cipher?: CipherView) {
    try {
      const sanitizedTitle = MainContextMenuHandler.sanitizeContextMenuTitle(title);

      const createChildItem = async (parentId: string) => {
        const menuItemId = `${parentId}_${optionId}`;

        return await this.create({
          type: "normal",
          id: menuItemId,
          parentId,
          title: sanitizedTitle,
          contexts: ["all"],
        });
      };

      if (
        !cipher ||
        (cipher.type === CipherType.Login && !Utils.isNullOrEmpty(cipher.login?.password))
      ) {
        await createChildItem(AUTOFILL_ID);

        if (cipher?.viewPassword ?? true) {
          await createChildItem(COPY_PASSWORD_ID);
        }
      }

      if (
        !cipher ||
        (cipher.type === CipherType.Login && !Utils.isNullOrEmpty(cipher.login?.username))
      ) {
        await createChildItem(COPY_USERNAME_ID);
      }

      const canAccessPremium = await this.stateService.getCanAccessPremium();
      if (canAccessPremium && (!cipher || !Utils.isNullOrEmpty(cipher.login?.totp))) {
        await createChildItem(COPY_VERIFICATION_CODE_ID);
      }

      if ((!cipher || cipher.type === CipherType.Card) && optionId !== CREATE_LOGIN_ID) {
        await createChildItem(AUTOFILL_CARD_ID);
      }

      if ((!cipher || cipher.type === CipherType.Identity) && optionId !== CREATE_LOGIN_ID) {
        await createChildItem(AUTOFILL_IDENTITY_ID);
      }
    } catch (error) {
      this.logService.warning(error.message);
    }
  }

  static sanitizeContextMenuTitle(title: string): string {
    return title.replace(/&/g, "&&");
  }

  async noAccess() {
    if (await this.init()) {
      const authed = await this.stateService.getIsAuthenticated();
      await this.loadOptions(
        this.i18nService.t(authed ? "unlockVaultMenu" : "loginToVaultMenu"),
        NOOP_COMMAND_SUFFIX
      );
    }
  }

  async noCards() {
    await this.create({
      id: `${AUTOFILL_CARD_ID}_NOTICE`,
      enabled: false,
      parentId: AUTOFILL_CARD_ID,
      title: this.i18nService.t("noCards"),
      type: "normal",
    });

    await this.create({
      id: `${AUTOFILL_CARD_ID}_${SEPARATOR_ID}`,
      parentId: AUTOFILL_CARD_ID,
      type: "separator",
    });

    await this.create({
      id: `${AUTOFILL_CARD_ID}_${CREATE_CARD_ID}`,
      parentId: AUTOFILL_CARD_ID,
      title: this.i18nService.t("addCardMenu"),
      type: "normal",
    });
  }

  async noIdentities() {
    await this.create({
      id: `${AUTOFILL_IDENTITY_ID}_NOTICE`,
      enabled: false,
      parentId: AUTOFILL_IDENTITY_ID,
      title: this.i18nService.t("noIdentities"),
      type: "normal",
    });

    await this.create({
      id: `${AUTOFILL_IDENTITY_ID}_${SEPARATOR_ID}`,
      parentId: AUTOFILL_IDENTITY_ID,
      type: "separator",
    });

    await this.create({
      id: `${AUTOFILL_IDENTITY_ID}_${CREATE_IDENTITY_ID}`,
      parentId: AUTOFILL_IDENTITY_ID,
      title: this.i18nService.t("addIdentityMenu"),
      type: "normal",
    });
  }

  async noLogins() {
    await this.create({
      id: `${AUTOFILL_ID}_NOTICE`,
      enabled: false,
      parentId: AUTOFILL_ID,
      title: this.i18nService.t("noMatchingLogins"),
      type: "normal",
    });

    await this.create({
      id: `${AUTOFILL_ID}_${SEPARATOR_ID}` + 1,
      parentId: AUTOFILL_ID,
      type: "separator",
    });

    await this.loadOptions(this.i18nService.t("addLoginMenu"), CREATE_LOGIN_ID);
  }
}
