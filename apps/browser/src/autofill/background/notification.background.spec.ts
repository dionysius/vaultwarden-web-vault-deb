import { mock } from "jest-mock-extended";
import { firstValueFrom } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/services/policy/policy.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { AuthService } from "@bitwarden/common/auth/services/auth.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { EnvironmentService } from "@bitwarden/common/platform/services/environment.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";
import { FolderService } from "@bitwarden/common/vault/services/folder/folder.service";

import { BrowserApi } from "../../platform/browser/browser-api";
import { BrowserStateService } from "../../platform/services/browser-state.service";
import { NotificationQueueMessageType } from "../enums/notification-queue-message-type.enum";
import { FormData } from "../services/abstractions/autofill.service";
import AutofillService from "../services/autofill.service";
import { createAutofillPageDetailsMock, createChromeTabMock } from "../spec/autofill-mocks";
import { flushPromises, sendExtensionRuntimeMessage } from "../spec/testing-utils";

import {
  AddLoginQueueMessage,
  AddUnlockVaultQueueMessage,
  LockedVaultPendingNotificationsData,
  NotificationBackgroundExtensionMessage,
} from "./abstractions/notification.background";
import NotificationBackground from "./notification.background";

jest.mock("rxjs", () => {
  const rxjs = jest.requireActual("rxjs");
  const { firstValueFrom } = rxjs;
  return {
    ...rxjs,
    firstValueFrom: jest.fn(firstValueFrom),
  };
});

describe("NotificationBackground", () => {
  let notificationBackground: NotificationBackground;
  const autofillService = mock<AutofillService>();
  const cipherService = mock<CipherService>();
  const authService = mock<AuthService>();
  const policyService = mock<PolicyService>();
  const folderService = mock<FolderService>();
  const stateService = mock<BrowserStateService>();
  const environmentService = mock<EnvironmentService>();
  const logService = mock<LogService>();

  beforeEach(() => {
    notificationBackground = new NotificationBackground(
      autofillService,
      cipherService,
      authService,
      policyService,
      folderService,
      stateService,
      environmentService,
      logService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("convertAddLoginQueueMessageToCipherView", () => {
    it("returns a cipher view when passed an `AddLoginQueueMessage`", () => {
      const message: AddLoginQueueMessage = {
        type: "add",
        username: "test",
        password: "password",
        uri: "https://example.com",
        domain: "",
        tab: createChromeTabMock(),
        expires: new Date(),
        wasVaultLocked: false,
      };
      const cipherView = notificationBackground["convertAddLoginQueueMessageToCipherView"](message);

      expect(cipherView.name).toEqual("example.com");
      expect(cipherView.login).toEqual({
        autofillOnPageLoad: null,
        fido2Credentials: null,
        password: message.password,
        passwordRevisionDate: null,
        totp: null,
        uris: [
          {
            _canLaunch: null,
            _domain: null,
            _host: null,
            _hostname: null,
            _uri: message.uri,
            match: null,
          },
        ],
        username: message.username,
      });
    });

    it("returns a cipher view assigned to an existing folder id", () => {
      const folderId = "folder-id";
      const message: AddLoginQueueMessage = {
        type: "add",
        username: "test",
        password: "password",
        uri: "https://example.com",
        domain: "example.com",
        tab: createChromeTabMock(),
        expires: new Date(),
        wasVaultLocked: false,
      };
      const cipherView = notificationBackground["convertAddLoginQueueMessageToCipherView"](
        message,
        folderId,
      );

      expect(cipherView.folderId).toEqual(folderId);
    });
  });

  describe("notification bar extension message handlers", () => {
    beforeEach(async () => {
      await notificationBackground.init();
    });

    it("ignores messages whose command does not match the expected handlers", () => {
      const message: NotificationBackgroundExtensionMessage = { command: "unknown" };
      jest.spyOn(notificationBackground as any, "handleSaveCipherMessage");

      sendExtensionRuntimeMessage(message);

      expect(notificationBackground["handleSaveCipherMessage"]).not.toHaveBeenCalled();
    });

    describe("unlockCompleted message handler", () => {
      it("sends a `closeNotificationBar` message if the retryCommand is for `autofill_login", async () => {
        const sender = mock<chrome.runtime.MessageSender>({ tab: { id: 1 } });
        const message: NotificationBackgroundExtensionMessage = {
          command: "unlockCompleted",
          data: {
            commandToRetry: { message: { command: "autofill_login" } },
          } as LockedVaultPendingNotificationsData,
        };
        jest.spyOn(BrowserApi, "tabSendMessageData").mockImplementation();

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(BrowserApi.tabSendMessageData).toHaveBeenCalledWith(
          sender.tab,
          "closeNotificationBar",
        );
      });

      it("triggers a retryHandler if the message target is `notification.background` and a handler exists", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "unlockCompleted",
          data: {
            commandToRetry: { message: { command: "bgSaveCipher" } },
            target: "notification.background",
          } as LockedVaultPendingNotificationsData,
        };
        jest.spyOn(notificationBackground as any, "handleSaveCipherMessage").mockImplementation();

        sendExtensionRuntimeMessage(message);
        await flushPromises();

        expect(notificationBackground["handleSaveCipherMessage"]).toHaveBeenCalledWith(
          message.data.commandToRetry.message,
          message.data.commandToRetry.sender,
        );
      });
    });

    describe("bgGetFolderData message handler", () => {
      it("returns a list of folders", async () => {
        const folderView = mock<FolderView>({ id: "folder-id" });
        const folderViews = [folderView];
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgGetFolderData",
        };
        jest.spyOn(notificationBackground as any, "getFolderData");
        (firstValueFrom as jest.Mock).mockResolvedValueOnce(folderViews);

        sendExtensionRuntimeMessage(message);
        await flushPromises();

        expect(notificationBackground["getFolderData"]).toHaveBeenCalled();
        expect(firstValueFrom).toHaveBeenCalled();
      });
    });

    describe("bgCloseNotificationBar message handler", () => {
      it("sends a `closeNotificationBar` message to the sender tab", async () => {
        const sender = mock<chrome.runtime.MessageSender>({ tab: { id: 1 } });
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgCloseNotificationBar",
        };
        jest.spyOn(BrowserApi, "tabSendMessageData").mockImplementation();

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(BrowserApi.tabSendMessageData).toHaveBeenCalledWith(
          sender.tab,
          "closeNotificationBar",
        );
      });
    });

    describe("bgAdjustNotificationBar message handler", () => {
      it("sends a `adjustNotificationBar` message to the sender tab", async () => {
        const sender = mock<chrome.runtime.MessageSender>({ tab: { id: 1 } });
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgAdjustNotificationBar",
          data: { height: 100 },
        };
        jest.spyOn(BrowserApi, "tabSendMessageData").mockImplementation();

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(BrowserApi.tabSendMessageData).toHaveBeenCalledWith(
          sender.tab,
          "adjustNotificationBar",
          message.data,
        );
      });
    });

    describe("bgAddLogin message handler", () => {
      let tab: chrome.tabs.Tab;
      let sender: chrome.runtime.MessageSender;
      let getAuthStatusSpy: jest.SpyInstance;
      let getDisableAddLoginNotificationSpy: jest.SpyInstance;
      let getDisableChangedPasswordNotificationSpy: jest.SpyInstance;
      let pushAddLoginToQueueSpy: jest.SpyInstance;
      let pushChangePasswordToQueueSpy: jest.SpyInstance;
      let getAllDecryptedForUrlSpy: jest.SpyInstance;

      beforeEach(() => {
        tab = createChromeTabMock();
        sender = mock<chrome.runtime.MessageSender>({ tab });
        getAuthStatusSpy = jest.spyOn(authService, "getAuthStatus");
        getDisableAddLoginNotificationSpy = jest.spyOn(
          stateService,
          "getDisableAddLoginNotification",
        );
        getDisableChangedPasswordNotificationSpy = jest.spyOn(
          stateService,
          "getDisableChangedPasswordNotification",
        );
        pushAddLoginToQueueSpy = jest.spyOn(notificationBackground as any, "pushAddLoginToQueue");
        pushChangePasswordToQueueSpy = jest.spyOn(
          notificationBackground as any,
          "pushChangePasswordToQueue",
        );
        getAllDecryptedForUrlSpy = jest.spyOn(cipherService, "getAllDecryptedForUrl");
      });

      it("skips attempting to add the login if the user is logged out", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgAddLogin",
          login: { username: "test", password: "password", url: "https://example.com" },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.LoggedOut);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getDisableAddLoginNotificationSpy).not.toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips attempting to add the login if the login data does not contain a valid url", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgAddLogin",
          login: { username: "test", password: "password", url: "" },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Locked);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getDisableAddLoginNotificationSpy).not.toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips attempting to add the login if the user with a locked vault has disabled the login notification", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgAddLogin",
          login: { username: "test", password: "password", url: "https://example.com" },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Locked);
        getDisableAddLoginNotificationSpy.mockReturnValueOnce(true);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getDisableAddLoginNotificationSpy).toHaveBeenCalled();
        expect(getAllDecryptedForUrlSpy).not.toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).not.toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips attempting to add the login if the user with an unlocked vault has disabled the login notification", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgAddLogin",
          login: { username: "test", password: "password", url: "https://example.com" },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getDisableAddLoginNotificationSpy.mockReturnValueOnce(true);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getDisableAddLoginNotificationSpy).toHaveBeenCalled();
        expect(getAllDecryptedForUrlSpy).toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).not.toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips attempting to change the password for an existing login if the user has disabled changing the password notification", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgAddLogin",
          login: { username: "test", password: "password", url: "https://example.com" },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getDisableAddLoginNotificationSpy.mockReturnValueOnce(false);
        getDisableChangedPasswordNotificationSpy.mockReturnValueOnce(true);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({ login: { username: "test", password: "oldPassword" } }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getDisableAddLoginNotificationSpy).toHaveBeenCalled();
        expect(getAllDecryptedForUrlSpy).toHaveBeenCalled();
        expect(getDisableChangedPasswordNotificationSpy).toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).not.toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips attempting to change the password for an existing login if the password has not changed", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgAddLogin",
          login: { username: "test", password: "password", url: "https://example.com" },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getDisableAddLoginNotificationSpy.mockReturnValueOnce(false);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({ login: { username: "test", password: "password" } }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getDisableAddLoginNotificationSpy).toHaveBeenCalled();
        expect(getAllDecryptedForUrlSpy).toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).not.toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("adds the login to the queue if the user has a locked account", async () => {
        const login = { username: "test", password: "password", url: "https://example.com" };
        const message: NotificationBackgroundExtensionMessage = { command: "bgAddLogin", login };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Locked);
        getDisableAddLoginNotificationSpy.mockReturnValueOnce(false);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).toHaveBeenCalledWith("example.com", login, sender.tab, true);
      });

      it("adds the login to the queue if the user has an unlocked account and the login is new", async () => {
        const login = {
          username: undefined,
          password: "password",
          url: "https://example.com",
        } as any;
        const message: NotificationBackgroundExtensionMessage = { command: "bgAddLogin", login };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getDisableAddLoginNotificationSpy.mockReturnValueOnce(false);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({ login: { username: "anotherTestUsername", password: "password" } }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(pushAddLoginToQueueSpy).toHaveBeenCalledWith("example.com", login, sender.tab);
      });

      it("adds a change password message to the queue if the user has changed an existing cipher's password", async () => {
        const login = { username: "tEsT", password: "password", url: "https://example.com" };
        const message: NotificationBackgroundExtensionMessage = { command: "bgAddLogin", login };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getDisableAddLoginNotificationSpy.mockReturnValueOnce(false);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({
            id: "cipher-id",
            login: { username: "test", password: "oldPassword" },
          }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(pushChangePasswordToQueueSpy).toHaveBeenCalledWith(
          "cipher-id",
          "example.com",
          login.password,
          sender.tab,
        );
      });
    });

    describe("bgChangedPassword message handler", () => {
      let tab: chrome.tabs.Tab;
      let sender: chrome.runtime.MessageSender;
      let getAuthStatusSpy: jest.SpyInstance;
      let pushChangePasswordToQueueSpy: jest.SpyInstance;
      let getAllDecryptedForUrlSpy: jest.SpyInstance;

      beforeEach(() => {
        tab = createChromeTabMock();
        sender = mock<chrome.runtime.MessageSender>({ tab });
        getAuthStatusSpy = jest.spyOn(authService, "getAuthStatus");
        pushChangePasswordToQueueSpy = jest.spyOn(
          notificationBackground as any,
          "pushChangePasswordToQueue",
        );
        getAllDecryptedForUrlSpy = jest.spyOn(cipherService, "getAllDecryptedForUrl");
      });

      it("skips attempting to add the change password message to the queue if the passed url is not valid", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgChangedPassword",
          data: { newPassword: "newPassword", currentPassword: "currentPassword", url: "" },
        };

        sendExtensionRuntimeMessage(message);
        await flushPromises();

        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("adds a change password message to the queue if the user does not have an unlocked account", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgChangedPassword",
          data: {
            newPassword: "newPassword",
            currentPassword: "currentPassword",
            url: "https://example.com",
          },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Locked);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).toHaveBeenCalledWith(
          null,
          "example.com",
          message.data.newPassword,
          sender.tab,
          true,
        );
      });

      it("skips adding a change password message to the queue if the multiple ciphers exist for the passed URL and the current password is not found within the list of ciphers", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgChangedPassword",
          data: {
            newPassword: "newPassword",
            currentPassword: "currentPassword",
            url: "https://example.com",
          },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({ login: { username: "test", password: "password" } }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getAllDecryptedForUrlSpy).toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips adding a change password message if more than one existing cipher is found with a matching password ", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgChangedPassword",
          data: {
            newPassword: "newPassword",
            currentPassword: "currentPassword",
            url: "https://example.com",
          },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({ login: { username: "test", password: "password" } }),
          mock<CipherView>({ login: { username: "test2", password: "password" } }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getAllDecryptedForUrlSpy).toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("adds a change password message to the queue if a single cipher matches the passed current password", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgChangedPassword",
          data: {
            newPassword: "newPassword",
            currentPassword: "currentPassword",
            url: "https://example.com",
          },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({
            id: "cipher-id",
            login: { username: "test", password: "currentPassword" },
          }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(pushChangePasswordToQueueSpy).toHaveBeenCalledWith(
          "cipher-id",
          "example.com",
          message.data.newPassword,
          sender.tab,
        );
      });

      it("skips adding a change password message if no current password is passed in the message and more than one cipher is found for a url", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgChangedPassword",
          data: {
            newPassword: "newPassword",
            url: "https://example.com",
          },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({ login: { username: "test", password: "password" } }),
          mock<CipherView>({ login: { username: "test2", password: "password" } }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(getAllDecryptedForUrlSpy).toHaveBeenCalled();
        expect(pushChangePasswordToQueueSpy).not.toHaveBeenCalled();
      });

      it("adds a change password message to the queue if no current password is passed with the message, but a single cipher is matched for the uri", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgChangedPassword",
          data: {
            newPassword: "newPassword",
            url: "https://example.com",
          },
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Unlocked);
        getAllDecryptedForUrlSpy.mockResolvedValueOnce([
          mock<CipherView>({
            id: "cipher-id",
            login: { username: "test", password: "password" },
          }),
        ]);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(pushChangePasswordToQueueSpy).toHaveBeenCalledWith(
          "cipher-id",
          "example.com",
          message.data.newPassword,
          sender.tab,
        );
      });
    });

    describe("bgRemoveTabFromNotificationQueue message handler", () => {
      it("splices a notification queue item based on the passed tab", async () => {
        const tab = createChromeTabMock({ id: 2 });
        const sender = mock<chrome.runtime.MessageSender>({ tab });
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgRemoveTabFromNotificationQueue",
        };
        const removeTabFromNotificationQueueSpy = jest.spyOn(
          notificationBackground as any,
          "removeTabFromNotificationQueue",
        );
        const firstQueueMessage = mock<AddLoginQueueMessage>({
          tab: createChromeTabMock({ id: 1 }),
        });
        const secondQueueMessage = mock<AddLoginQueueMessage>({ tab });
        const thirdQueueMessage = mock<AddLoginQueueMessage>({
          tab: createChromeTabMock({ id: 3 }),
        });
        notificationBackground["notificationQueue"] = [
          firstQueueMessage,
          secondQueueMessage,
          thirdQueueMessage,
        ];

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(removeTabFromNotificationQueueSpy).toHaveBeenCalledWith(tab);
        expect(notificationBackground["notificationQueue"]).toEqual([
          firstQueueMessage,
          thirdQueueMessage,
        ]);
      });
    });

    describe("bgNeverSave message handler", () => {
      let tabSendMessageDataSpy: jest.SpyInstance;

      beforeEach(() => {
        tabSendMessageDataSpy = jest.spyOn(BrowserApi, "tabSendMessageData");
      });

      it("skips saving the domain as a never value if the passed tab does not exist within the notification queue", async () => {
        const tab = createChromeTabMock({ id: 2 });
        const sender = mock<chrome.runtime.MessageSender>({ tab });
        const message: NotificationBackgroundExtensionMessage = { command: "bgNeverSave" };
        notificationBackground["notificationQueue"] = [
          mock<AddLoginQueueMessage>({
            tab: createChromeTabMock({ id: 1 }),
          }),
          mock<AddLoginQueueMessage>({
            tab: createChromeTabMock({ id: 3 }),
          }),
        ];

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(tabSendMessageDataSpy).not.toHaveBeenCalled();
      });

      it("skips saving the domain as a never value if the tab does not contain an addLogin message within the NotificationQueue", async () => {
        const tab = createChromeTabMock({ id: 2 });
        const sender = mock<chrome.runtime.MessageSender>({ tab });
        const message: NotificationBackgroundExtensionMessage = { command: "bgNeverSave" };
        notificationBackground["notificationQueue"] = [
          mock<AddUnlockVaultQueueMessage>({ type: NotificationQueueMessageType.UnlockVault, tab }),
        ];

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(tabSendMessageDataSpy).not.toHaveBeenCalled();
      });

      it("skips saving the domain as a never value if the tab url does not match the queue message domain", async () => {
        const tab = createChromeTabMock({ id: 2, url: "https://example.com" });
        const sender = mock<chrome.runtime.MessageSender>({ tab });
        const message: NotificationBackgroundExtensionMessage = { command: "bgNeverSave" };
        notificationBackground["notificationQueue"] = [
          mock<AddLoginQueueMessage>({
            type: NotificationQueueMessageType.AddLogin,
            tab,
            domain: "another.com",
          }),
        ];

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(tabSendMessageDataSpy).not.toHaveBeenCalled();
      });

      it("saves the tabs domain as a never value and closes the notification bar", async () => {
        const tab = createChromeTabMock({ id: 2, url: "https://example.com" });
        const sender = mock<chrome.runtime.MessageSender>({ tab });
        const message: NotificationBackgroundExtensionMessage = { command: "bgNeverSave" };
        const firstNotification = mock<AddLoginQueueMessage>({
          type: NotificationQueueMessageType.AddLogin,
          tab,
          domain: "example.com",
        });
        const secondNotification = mock<AddLoginQueueMessage>({
          type: NotificationQueueMessageType.AddLogin,
          tab: createChromeTabMock({ id: 3 }),
          domain: "another.com",
        });
        notificationBackground["notificationQueue"] = [firstNotification, secondNotification];
        jest.spyOn(cipherService, "saveNeverDomain").mockImplementation();
        jest.spyOn(BrowserApi, "tabSendMessageData").mockImplementation();

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(tabSendMessageDataSpy).toHaveBeenCalledWith(tab, "closeNotificationBar");
        expect(cipherService.saveNeverDomain).toHaveBeenCalledWith("example.com");
        expect(notificationBackground["notificationQueue"]).toEqual([secondNotification]);
      });
    });

    describe("collectPageDetailsResponse", () => {
      let tabSendMessageDataSpy: jest.SpyInstance;

      beforeEach(() => {
        tabSendMessageDataSpy = jest.spyOn(BrowserApi, "tabSendMessageData");
      });

      it("skips sending the `notificationBarPageDetails` message if the message sender is not `notificationBar`", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "collectPageDetailsResponse",
          sender: "not-notificationBar",
        };

        sendExtensionRuntimeMessage(message);
        await flushPromises();

        expect(tabSendMessageDataSpy).not.toHaveBeenCalled();
      });

      it("sends a `notificationBarPageDetails` message with the forms with password fields", async () => {
        const tab = createChromeTabMock();
        const message: NotificationBackgroundExtensionMessage = {
          command: "collectPageDetailsResponse",
          sender: "notificationBar",
          details: createAutofillPageDetailsMock(),
          tab,
        };
        const formData = [mock<FormData>()];
        jest.spyOn(autofillService, "getFormsWithPasswordFields").mockReturnValueOnce(formData);

        sendExtensionRuntimeMessage(message);
        await flushPromises();

        expect(tabSendMessageDataSpy).toHaveBeenCalledWith(
          message.tab,
          "notificationBarPageDetails",
          {
            details: message.details,
            forms: formData,
          },
        );
      });
    });

    describe("bgUnlockPopoutOpened message handler", () => {
      let getAuthStatusSpy: jest.SpyInstance;
      let pushUnlockVaultToQueueSpy: jest.SpyInstance;

      beforeEach(() => {
        getAuthStatusSpy = jest.spyOn(authService, "getAuthStatus");
        pushUnlockVaultToQueueSpy = jest.spyOn(
          notificationBackground as any,
          "pushUnlockVaultToQueue",
        );
      });

      it("skips pushing the unlock vault message to the queue if the message indicates that the notification should be skipped", async () => {
        const tabMock = createChromeTabMock();
        const sender = mock<chrome.runtime.MessageSender>({ tab: tabMock });
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgUnlockPopoutOpened",
          data: { skipNotification: true },
        };

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).not.toHaveBeenCalled();
        expect(pushUnlockVaultToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips pushing the unlock vault message to the queue if the auth status is not `Locked`", async () => {
        const tabMock = createChromeTabMock();
        const sender = mock<chrome.runtime.MessageSender>({ tab: tabMock });
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgUnlockPopoutOpened",
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.LoggedOut);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(getAuthStatusSpy).toHaveBeenCalled();
        expect(pushUnlockVaultToQueueSpy).not.toHaveBeenCalled();
      });

      it("skips pushing the unlock vault message to the queue if the notification queue already has an item", async () => {
        const tabMock = createChromeTabMock();
        const sender = mock<chrome.runtime.MessageSender>({ tab: tabMock });
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgUnlockPopoutOpened",
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Locked);
        notificationBackground["notificationQueue"] = [mock<AddLoginQueueMessage>()];

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(pushUnlockVaultToQueueSpy).not.toHaveBeenCalled();
      });

      it("sends an unlock vault message to the queue if the user has a locked vault", async () => {
        const tabMock = createChromeTabMock({ url: "https://example.com" });
        const sender = mock<chrome.runtime.MessageSender>({ tab: tabMock });
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgUnlockPopoutOpened",
        };
        getAuthStatusSpy.mockResolvedValueOnce(AuthenticationStatus.Locked);

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(pushUnlockVaultToQueueSpy).toHaveBeenCalledWith("example.com", sender.tab);
      });
    });

    describe("checkNotificationQueue", () => {
      let doNotificationQueueCheckSpy: jest.SpyInstance;
      let getTabFromCurrentWindowSpy: jest.SpyInstance;

      beforeEach(() => {
        doNotificationQueueCheckSpy = jest.spyOn(
          notificationBackground as any,
          "doNotificationQueueCheck",
        );
        getTabFromCurrentWindowSpy = jest.spyOn(BrowserApi, "getTabFromCurrentWindow");
      });

      it("skips checking the notification queue if the queue does not contain any items", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "checkNotificationQueue",
        };
        notificationBackground["notificationQueue"] = [];

        sendExtensionRuntimeMessage(message);
        await flushPromises();

        expect(doNotificationQueueCheckSpy).not.toHaveBeenCalled();
      });

      it("checks the notification queue for the sender tab", async () => {
        const tab = createChromeTabMock();
        const sender = mock<chrome.runtime.MessageSender>({ tab });
        const message: NotificationBackgroundExtensionMessage = {
          command: "checkNotificationQueue",
        };
        notificationBackground["notificationQueue"] = [
          mock<AddLoginQueueMessage>({ tab }),
          mock<AddLoginQueueMessage>({ tab: createChromeTabMock({ id: 2 }) }),
        ];

        sendExtensionRuntimeMessage(message, sender);
        await flushPromises();

        expect(doNotificationQueueCheckSpy).toHaveBeenCalledWith(tab);
      });

      it("checks the notification queue for the current tab if the sender does not send a tab", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "checkNotificationQueue",
        };
        const currenTab = createChromeTabMock({ id: 2 });
        notificationBackground["notificationQueue"] = [
          mock<AddLoginQueueMessage>({ tab: currenTab }),
        ];
        getTabFromCurrentWindowSpy.mockResolvedValueOnce(currenTab);

        sendExtensionRuntimeMessage(message, mock<chrome.runtime.MessageSender>({ tab: null }));
        await flushPromises();

        expect(getTabFromCurrentWindowSpy).toHaveBeenCalledWith();
        expect(doNotificationQueueCheckSpy).toHaveBeenCalledWith(currenTab);
      });
    });

    describe("bgReopenUnlockPopout message handler", () => {
      it("opens the unlock popout window", async () => {
        const message: NotificationBackgroundExtensionMessage = {
          command: "bgReopenUnlockPopout",
        };
        const openUnlockWindowSpy = jest.spyOn(notificationBackground as any, "openUnlockPopout");

        sendExtensionRuntimeMessage(message);
        await flushPromises();

        expect(openUnlockWindowSpy).toHaveBeenCalled();
      });
    });
  });
});
