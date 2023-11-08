import { mock } from "jest-mock-extended";

import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";

import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";

import {
  closeAddEditVaultItemPopout,
  closeFido2Popout,
  openAddEditVaultItemPopout,
  openFido2Popout,
  openVaultItemPasswordRepromptPopout,
  VaultPopoutType,
} from "./vault-popout-window";

describe("VaultPopoutWindow", () => {
  const openPopoutSpy = jest
    .spyOn(BrowserPopupUtils, "openPopout")
    .mockResolvedValue(mock<chrome.windows.Window>({ id: 10 }));
  const closeSingleActionPopoutSpy = jest
    .spyOn(BrowserPopupUtils, "closeSingleActionPopout")
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("openVaultItemPasswordRepromptPopout", () => {
    it("opens a popout window that facilitates re-prompting for the password of a vault item", async () => {
      const senderTab = { windowId: 1 } as chrome.tabs.Tab;

      await openVaultItemPasswordRepromptPopout(senderTab, {
        cipherId: "cipherId",
        action: "action",
      });

      expect(openPopoutSpy).toHaveBeenCalledWith(
        "popup/index.html#/view-cipher?cipherId=cipherId&senderTabId=undefined&action=action",
        {
          singleActionKey: `${VaultPopoutType.vaultItemPasswordReprompt}_cipherId`,
          senderWindowId: 1,
          forceCloseExistingWindows: true,
        }
      );
    });
  });

  describe("openAddEditVaultItemPopout", () => {
    it("opens a popout window that facilitates adding a vault item", async () => {
      await openAddEditVaultItemPopout(
        mock<chrome.tabs.Tab>({ windowId: 1, url: "https://tacos.com" })
      );

      expect(openPopoutSpy).toHaveBeenCalledWith(
        "popup/index.html#/edit-cipher?uilocation=popout&uri=https://tacos.com",
        {
          singleActionKey: VaultPopoutType.addEditVaultItem,
          senderWindowId: 1,
        }
      );
    });

    it("opens a popout window that facilitates adding a specific type of vault item", () => {
      openAddEditVaultItemPopout(mock<chrome.tabs.Tab>({ windowId: 1, url: "https://tacos.com" }), {
        cipherType: CipherType.Identity,
      });

      expect(openPopoutSpy).toHaveBeenCalledWith(
        `popup/index.html#/edit-cipher?uilocation=popout&type=${CipherType.Identity}&uri=https://tacos.com`,
        {
          singleActionKey: `${VaultPopoutType.addEditVaultItem}_${CipherType.Identity}`,
          senderWindowId: 1,
        }
      );
    });

    it("opens a popout window that facilitates editing a vault item", async () => {
      await openAddEditVaultItemPopout(
        mock<chrome.tabs.Tab>({ windowId: 1, url: "https://tacos.com" }),
        {
          cipherId: "cipherId",
        }
      );

      expect(openPopoutSpy).toHaveBeenCalledWith(
        "popup/index.html#/edit-cipher?uilocation=popout&cipherId=cipherId&uri=https://tacos.com",
        {
          singleActionKey: `${VaultPopoutType.addEditVaultItem}_cipherId`,
          senderWindowId: 1,
        }
      );
    });
  });

  describe("closeAddEditVaultItemPopout", () => {
    it("closes the add/edit vault item popout window", () => {
      closeAddEditVaultItemPopout();

      expect(closeSingleActionPopoutSpy).toHaveBeenCalledWith(VaultPopoutType.addEditVaultItem, 0);
    });

    it("closes the add/edit vault item popout window after a delay", () => {
      closeAddEditVaultItemPopout(1000);

      expect(closeSingleActionPopoutSpy).toHaveBeenCalledWith(
        VaultPopoutType.addEditVaultItem,
        1000
      );
    });
  });

  describe("openFido2Popout", () => {
    it("opens a popout window that facilitates FIDO2 authentication workflows", async () => {
      const senderTab = mock<chrome.tabs.Tab>({
        windowId: 1,
        url: "https://jest-testing.com",
        id: 2,
      });

      const returnedWindowId = await openFido2Popout(senderTab, {
        sessionId: "sessionId",
        fallbackSupported: true,
      });

      expect(openPopoutSpy).toHaveBeenCalledWith(
        "popup/index.html#/fido2?sessionId=sessionId&fallbackSupported=true&senderTabId=2&senderUrl=https%3A%2F%2Fjest-testing.com",
        {
          singleActionKey: `${VaultPopoutType.fido2Popout}_sessionId`,
          senderWindowId: 1,
          forceCloseExistingWindows: true,
          windowOptions: { height: 450 },
        }
      );
      expect(returnedWindowId).toEqual(10);
    });
  });

  describe("closeFido2Popout", () => {
    it("closes the fido2 popout window", () => {
      const sessionId = "sessionId";

      closeFido2Popout(sessionId);

      expect(closeSingleActionPopoutSpy).toHaveBeenCalledWith(
        `${VaultPopoutType.fido2Popout}_${sessionId}`
      );
    });
  });
});
