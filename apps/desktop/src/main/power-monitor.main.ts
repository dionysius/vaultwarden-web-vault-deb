import { powerMonitor } from "electron";

import { ElectronMainMessagingService } from "../services/electron-main-messaging.service";
import { isSnapStore } from "../utils";

// tslint:disable-next-line
const IdleLockSeconds = 5 * 60; // 5 minutes
const IdleCheckInterval = 30 * 1000; // 30 seconds

export class PowerMonitorMain {
  private idle = false;

  constructor(private messagingService: ElectronMainMessagingService) {}

  init() {
    // ref: https://github.com/electron/electron/issues/13767
    if (!isSnapStore()) {
      // System sleep
      powerMonitor.on("suspend", () => {
        this.messagingService.send("systemSuspended");
      });
    }

    if (process.platform !== "linux") {
      // System locked
      powerMonitor.on("lock-screen", () => {
        this.messagingService.send("systemLocked");
      });
    }

    // System idle
    global.setInterval(() => {
      const idleSeconds: number = powerMonitor.getSystemIdleTime();
      const idle = idleSeconds >= IdleLockSeconds;
      if (idle) {
        if (this.idle) {
          return;
        }

        this.messagingService.send("systemIdle");
      }

      this.idle = idle;
    }, IdleCheckInterval);
  }
}
