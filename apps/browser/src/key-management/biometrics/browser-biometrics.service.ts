import { Injectable } from "@angular/core";

import { BiometricsService } from "@bitwarden/key-management";

import { BrowserApi } from "../../platform/browser/browser-api";

@Injectable()
export abstract class BrowserBiometricsService extends BiometricsService {
  async supportsBiometric() {
    const platformInfo = await BrowserApi.getPlatformInfo();
    if (platformInfo.os === "mac" || platformInfo.os === "win" || platformInfo.os === "linux") {
      return true;
    }
    return false;
  }

  abstract authenticateBiometric(): Promise<boolean>;
  abstract isBiometricUnlockAvailable(): Promise<boolean>;
}
