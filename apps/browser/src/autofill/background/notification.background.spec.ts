import { mock } from "jest-mock-extended";

import { PolicyService } from "@bitwarden/common/admin-console/services/policy/policy.service";
import { AuthService } from "@bitwarden/common/auth/services/auth.service";
import { EnvironmentService } from "@bitwarden/common/platform/services/environment.service";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";
import { FolderService } from "@bitwarden/common/vault/services/folder/folder.service";

import { BrowserStateService } from "../../platform/services/browser-state.service";
import AutofillService from "../services/autofill.service";
import { createChromeTabMock } from "../spec/autofill-mocks";

import { AddLoginQueueMessage } from "./abstractions/notification.background";
import NotificationBackground from "./notification.background";

describe("NotificationBackground", () => {
  let notificationBackground: NotificationBackground;
  const autofillService = mock<AutofillService>();
  const cipherService = mock<CipherService>();
  const authService = mock<AuthService>();
  const policyService = mock<PolicyService>();
  const folderService = mock<FolderService>();
  const stateService = mock<BrowserStateService>();
  const environmentService = mock<EnvironmentService>();

  beforeEach(() => {
    notificationBackground = new NotificationBackground(
      autofillService,
      cipherService,
      authService,
      policyService,
      folderService,
      stateService,
      environmentService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("unlockVault", () => {
    it("returns early if the message indicates that the notification should be skipped", async () => {
      const tabMock = createChromeTabMock();
      const message = { data: { skipNotification: true } };
      jest.spyOn(notificationBackground["authService"], "getAuthStatus");
      jest.spyOn(notificationBackground as any, "pushUnlockVaultToQueue");

      await notificationBackground["unlockVault"](message, tabMock);

      expect(notificationBackground["authService"].getAuthStatus).not.toHaveBeenCalled();
      expect(notificationBackground["pushUnlockVaultToQueue"]).not.toHaveBeenCalled();
    });
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
});
