import MainBackground from "./background/main.background";
import { onCommandListener } from "./listeners/onCommandListener";

const manifest = chrome.runtime.getManifest();

if (manifest.manifest_version === 3) {
  chrome.commands.onCommand.addListener(onCommandListener);
} else {
  const bitwardenMain = ((window as any).bitwardenMain = new MainBackground());
  bitwardenMain.bootstrap().then(() => {
    // Finished bootstrapping
  });
}
