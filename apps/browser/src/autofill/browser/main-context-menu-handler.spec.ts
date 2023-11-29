import { mock, MockProxy } from "jest-mock-extended";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { BrowserStateService } from "../../platform/services/abstractions/browser-state.service";

import { MainContextMenuHandler } from "./main-context-menu-handler";

describe("context-menu", () => {
  let stateService: MockProxy<BrowserStateService>;
  let i18nService: MockProxy<I18nService>;
  let logService: MockProxy<LogService>;

  let removeAllSpy: jest.SpyInstance<void, [callback?: () => void]>;
  let createSpy: jest.SpyInstance<
    string | number,
    [createProperties: chrome.contextMenus.CreateProperties, callback?: () => void]
  >;

  let sut: MainContextMenuHandler;

  beforeEach(() => {
    stateService = mock();
    i18nService = mock();
    logService = mock();

    removeAllSpy = jest
      .spyOn(chrome.contextMenus, "removeAll")
      .mockImplementation((callback) => callback());

    createSpy = jest.spyOn(chrome.contextMenus, "create").mockImplementation((props, callback) => {
      if (callback) {
        callback();
      }
      return props.id;
    });

    sut = new MainContextMenuHandler(stateService, i18nService, logService);
  });

  afterEach(() => jest.resetAllMocks());

  describe("init", () => {
    it("has menu disabled", async () => {
      stateService.getDisableContextMenuItem.mockResolvedValue(true);

      const createdMenu = await sut.init();
      expect(createdMenu).toBeFalsy();
      expect(removeAllSpy).toHaveBeenCalledTimes(1);
    });

    it("has menu enabled, but does not have premium", async () => {
      stateService.getDisableContextMenuItem.mockResolvedValue(false);

      stateService.getCanAccessPremium.mockResolvedValue(false);

      const createdMenu = await sut.init();
      expect(createdMenu).toBeTruthy();
      expect(createSpy).toHaveBeenCalledTimes(10);
    });

    it("has menu enabled and has premium", async () => {
      stateService.getDisableContextMenuItem.mockResolvedValue(false);

      stateService.getCanAccessPremium.mockResolvedValue(true);

      const createdMenu = await sut.init();
      expect(createdMenu).toBeTruthy();
      expect(createSpy).toHaveBeenCalledTimes(11);
    });
  });

  describe("loadOptions", () => {
    const createCipher = (data?: {
      id?: CipherView["id"];
      username?: CipherView["login"]["username"];
      password?: CipherView["login"]["password"];
      totp?: CipherView["login"]["totp"];
      viewPassword?: CipherView["viewPassword"];
    }): CipherView => {
      const { id, username, password, totp, viewPassword } = data || {};
      const cipherView = new CipherView(
        new Cipher({
          id: id ?? "1",
          type: CipherType.Login,
          viewPassword: viewPassword ?? true,
        } as any),
      );
      cipherView.login.username = username ?? "USERNAME";
      cipherView.login.password = password ?? "PASSWORD";
      cipherView.login.totp = totp ?? "TOTP";
      return cipherView;
    };

    it("is not a login cipher", async () => {
      await sut.loadOptions("TEST_TITLE", "1", {
        ...createCipher(),
        type: CipherType.SecureNote,
      } as any);

      expect(createSpy).not.toHaveBeenCalled();
    });

    it("creates item for autofill", async () => {
      await sut.loadOptions(
        "TEST_TITLE",
        "1",
        createCipher({
          username: "",
          totp: "",
          viewPassword: false,
        }),
      );

      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it("create entry for each cipher piece", async () => {
      stateService.getCanAccessPremium.mockResolvedValue(true);

      await sut.loadOptions("TEST_TITLE", "1", createCipher());

      // One for autofill, copy username, copy password, and copy totp code
      expect(createSpy).toHaveBeenCalledTimes(4);
    });

    it("creates a login/unlock item for each context menu action option when user is not authenticated", async () => {
      stateService.getCanAccessPremium.mockResolvedValue(true);

      await sut.loadOptions("TEST_TITLE", "NOOP");

      expect(createSpy).toHaveBeenCalledTimes(6);
    });
  });
});
