import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import { authServiceFactory } from "../background/service_factories/auth-service.factory";
import { autofillServiceFactory } from "../background/service_factories/autofill-service.factory";
import { CachedServices } from "../background/service_factories/factory-options";
import { logServiceFactory } from "../background/service_factories/log-service.factory";
import { BrowserApi } from "../browser/browserApi";
import { AutoFillActiveTabCommand } from "../commands/autoFillActiveTabCommand";
import { Account } from "../models/account";

export const onCommandListener = async (command: string, tab: chrome.tabs.Tab) => {
  switch (command) {
    case "autofill_login":
      await doAutoFillLogin(tab);
      break;
  }
};

const doAutoFillLogin = async (tab: chrome.tabs.Tab): Promise<void> => {
  const cachedServices: CachedServices = {};
  const opts = {
    cryptoFunctionServiceOptions: {
      win: self,
    },
    encryptServiceOptions: {
      logMacFailures: true,
    },
    logServiceOptions: {
      isDev: false,
    },
    platformUtilsServiceOptions: {
      clipboardWriteCallback: () => Promise.resolve(),
      biometricCallback: () => Promise.resolve(false),
      win: self,
    },
    stateServiceOptions: {
      stateFactory: new StateFactory(GlobalState, Account),
    },
    stateMigrationServiceOptions: {
      stateFactory: new StateFactory(GlobalState, Account),
    },
    apiServiceOptions: {
      logoutCallback: () => Promise.resolve(),
    },
    keyConnectorServiceOptions: {
      logoutCallback: () => Promise.resolve(),
    },
    i18nServiceOptions: {
      systemLanguage: BrowserApi.getUILanguage(self),
    },
    cipherServiceOptions: {
      searchServiceFactory: null as () => SearchService, // No dependence on search service
    },
  };
  const logService = await logServiceFactory(cachedServices, opts);
  const authService = await authServiceFactory(cachedServices, opts);
  const autofillService = await autofillServiceFactory(cachedServices, opts);

  const authStatus = await authService.getAuthStatus();
  if (authStatus < AuthenticationStatus.Unlocked) {
    // TODO: Add back in unlock on autofill
    logService.info("Currently not unlocked, MV3 does not support unlock on autofill currently.");
    return;
  }

  const command = new AutoFillActiveTabCommand(autofillService);
  await command.doAutoFillActiveTabCommand(tab);
};
