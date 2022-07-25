import { ipcMain } from "electron";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { biometrics } from "@bitwarden/desktop-native";
import { WindowMain } from "@bitwarden/electron/window.main";

import { BiometricMain } from "src/main/biometric/biometric.main";

export default class BiometricWindowsMain implements BiometricMain {
  constructor(
    private i18nservice: I18nService,
    private windowMain: WindowMain,
    private stateService: StateService,
    private logService: LogService
  ) {}

  async init() {
    let supportsBiometric = false;
    try {
      supportsBiometric = await this.supportsBiometric();
    } catch (e) {
      this.logService.error(e);
    }
    await this.stateService.setEnableBiometric(supportsBiometric);
    await this.stateService.setBiometricText("unlockWithWindowsHello");
    await this.stateService.setNoAutoPromptBiometricsText("autoPromptWindowsHello");

    ipcMain.handle("biometric", async () => {
      return await this.authenticateBiometric();
    });
  }

  async supportsBiometric(): Promise<boolean> {
    try {
      return await biometrics.available();
    } catch {
      return false;
    }
  }

  async authenticateBiometric(): Promise<boolean> {
    const hwnd = this.windowMain.win.getNativeWindowHandle();
    return await biometrics.prompt(hwnd, this.i18nservice.t("windowsHelloConsentMessage"));
  }
}
