import { VaultTimeoutService as BaseVaultTimeoutService } from "@bitwarden/common/services/vault-timeout/vault-timeout.service";

import { SafariApp } from "../../browser/safariApp";

export default class VaultTimeoutService extends BaseVaultTimeoutService {
  startCheck() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.checkVaultTimeout();
    if (this.platformUtilsService.isSafari()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.checkSafari();
    } else {
      setInterval(() => this.checkVaultTimeout(), 10 * 1000); // check every 10 seconds
    }
  }

  // This is a work-around to safari adding an arbitrary delay to setTimeout and
  //  setIntervals. It works by calling the native extension which sleeps for 10s,
  //  efficiently replicating setInterval.
  async checkSafari() {
    // eslint-disable-next-line
    while (true) {
      try {
        await SafariApp.sendMessageToApp("sleep");
        // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.checkVaultTimeout();
      } catch (e) {
        // eslint-disable-next-line
        console.log("Exception Safari VaultTimeout", e);
      }
    }
  }
}
