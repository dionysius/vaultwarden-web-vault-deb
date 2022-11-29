import { onAlarmListener } from "./alarms/on-alarm-listener";
import { registerAlarms } from "./alarms/register-alarms";
import MainBackground from "./background/main.background";
import { BrowserApi } from "./browser/browserApi";
import { onCommandListener } from "./listeners/onCommandListener";
import { onInstallListener } from "./listeners/onInstallListener";
import { UpdateBadge } from "./listeners/update-badge";

const manifestV3MessageListeners: ((
  serviceCache: Record<string, unknown>,
  message: { command: string }
) => void | Promise<void>)[] = [UpdateBadge.messageListener];

if (BrowserApi.manifestVersion === 3) {
  chrome.commands.onCommand.addListener(onCommandListener);
  chrome.runtime.onInstalled.addListener(onInstallListener);
  chrome.alarms.onAlarm.addListener(onAlarmListener);
  registerAlarms();
  chrome.tabs.onActivated.addListener(UpdateBadge.tabsOnActivatedListener);
  chrome.tabs.onReplaced.addListener(UpdateBadge.tabsOnReplacedListener);
  chrome.tabs.onUpdated.addListener(UpdateBadge.tabsOnUpdatedListener);
  BrowserApi.messageListener("runtime.background", (message) => {
    const serviceCache = {};

    manifestV3MessageListeners.forEach((listener) => {
      listener(serviceCache, message);
    });
  });
} else {
  const bitwardenMain = ((window as any).bitwardenMain = new MainBackground());
  bitwardenMain.bootstrap().then(() => {
    // Finished bootstrapping
  });
}
