import MainBackground from "./background/main.background";
import { ClearClipboard } from "./clipboard";
import { onCommandListener } from "./listeners/onCommandListener";
import { onInstallListener } from "./listeners/onInstallListener";

type AlarmAction = (executionTime: Date, serviceCache: Record<string, unknown>) => void;

const AlarmActions: AlarmAction[] = [ClearClipboard.run];

const manifest = chrome.runtime.getManifest();

if (manifest.manifest_version === 3) {
  chrome.commands.onCommand.addListener(onCommandListener);
  chrome.runtime.onInstalled.addListener(onInstallListener);
  chrome.alarms.onAlarm.addListener((_alarm) => {
    const executionTime = new Date();
    const serviceCache = {};

    for (const alarmAction of AlarmActions) {
      alarmAction(executionTime, serviceCache);
    }
  });
} else {
  const bitwardenMain = ((window as any).bitwardenMain = new MainBackground());
  bitwardenMain.bootstrap().then(() => {
    // Finished bootstrapping
  });
}
