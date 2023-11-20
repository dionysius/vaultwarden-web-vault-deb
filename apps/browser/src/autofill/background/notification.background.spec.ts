import { mock } from "jest-mock-extended";

import { PolicyService } from "@bitwarden/common/admin-console/services/policy/policy.service";
import { AuthService } from "@bitwarden/common/auth/services/auth.service";
import { EnvironmentService } from "@bitwarden/common/platform/services/environment.service";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";
import { FolderService } from "@bitwarden/common/vault/services/folder/folder.service";

import { BrowserStateService } from "../../platform/services/browser-state.service";
import { createChromeTabMock } from "../jest/autofill-mocks";
import AutofillService from "../services/autofill.service";

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
      environmentService
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
});
