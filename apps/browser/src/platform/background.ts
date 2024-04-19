import { ConsoleLogService } from "@bitwarden/common/platform/services/console-log.service";

import MainBackground from "../background/main.background";

import { BrowserApi } from "./browser/browser-api";

const logService = new ConsoleLogService(false);
if (BrowserApi.isManifestVersion(3)) {
  startHeartbeat().catch((error) => logService.error(error));
}
const bitwardenMain = ((self as any).bitwardenMain = new MainBackground());
bitwardenMain.bootstrap().catch((error) => logService.error(error));

/**
 * Tracks when a service worker was last alive and extends the service worker
 * lifetime by writing the current time to extension storage every 20 seconds.
 */
async function runHeartbeat() {
  await chrome.storage.local.set({ "last-heartbeat": new Date().getTime() });
}

/**
 * Starts the heartbeat interval which keeps the service worker alive.
 */
async function startHeartbeat() {
  // Run the heartbeat once at service worker startup, then again every 20 seconds.
  runHeartbeat()
    .then(() => setInterval(runHeartbeat, 20 * 1000))
    .catch((error) => logService.error(error));
}
