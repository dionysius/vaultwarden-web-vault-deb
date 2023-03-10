import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

import { WindowMain } from "../window.main";

import { BiometricsServiceAbstraction } from "./biometrics.service.abstraction";

export class BiometricsService implements BiometricsServiceAbstraction {
  private platformSpecificService: BiometricsServiceAbstraction;

  constructor(
    private i18nService: I18nService,
    private windowMain: WindowMain,
    private stateService: StateService,
    private logService: LogService,
    private messagingService: MessagingService,
    private platform: NodeJS.Platform
  ) {
    this.loadPlatformSpecificService(this.platform);
  }

  private loadPlatformSpecificService(platform: NodeJS.Platform) {
    if (platform === "win32") {
      this.loadWindowsHelloService();
    } else if (platform === "darwin") {
      this.loadMacOSService();
    }
  }

  private loadWindowsHelloService() {
    // eslint-disable-next-line
    const BiometricWindowsMain = require("./biometric.windows.main").default;
    this.platformSpecificService = new BiometricWindowsMain(
      this.i18nService,
      this.windowMain,
      this.stateService,
      this.logService
    );
  }

  private loadMacOSService() {
    // eslint-disable-next-line
    const BiometricDarwinMain = require("./biometric.darwin.main").default;
    this.platformSpecificService = new BiometricDarwinMain(this.i18nService, this.stateService);
  }

  async init() {
    return await this.platformSpecificService.init();
  }

  async supportsBiometric(): Promise<boolean> {
    return await this.platformSpecificService.supportsBiometric();
  }

  async authenticateBiometric(): Promise<boolean> {
    this.messagingService.send("cancelProcessReload");
    const response = await this.platformSpecificService.authenticateBiometric();
    if (!response) {
      this.messagingService.send("startProcessReload");
    }
    return response;
  }
}
