import { Component, NgZone } from "@angular/core";
import { Router } from "@angular/router";

import { LockComponent as BaseLockComponent } from "jslib-angular/components/lock.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";

import { BiometricErrors, BiometricErrorTypes } from "../../models/biometricErrors";

@Component({
  selector: "app-lock",
  templateUrl: "lock.component.html",
})
export class LockComponent extends BaseLockComponent {
  private isInitialLockScreen: boolean;

  biometricError: string;
  pendingBiometric = false;

  constructor(
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    cryptoService: CryptoService,
    vaultTimeoutService: VaultTimeoutService,
    environmentService: EnvironmentService,
    stateService: StateService,
    apiService: ApiService,
    logService: LogService,
    keyConnectorService: KeyConnectorService,
    ngZone: NgZone
  ) {
    super(
      router,
      i18nService,
      platformUtilsService,
      messagingService,
      cryptoService,
      vaultTimeoutService,
      environmentService,
      stateService,
      apiService,
      logService,
      keyConnectorService,
      ngZone
    );
    this.successRoute = "/tabs/current";
    this.isInitialLockScreen = (window as any).previousPopupUrl == null;
  }

  async ngOnInit() {
    await super.ngOnInit();
    const disableAutoBiometricsPrompt =
      (await this.stateService.getDisableAutoBiometricsPrompt()) ?? true;

    window.setTimeout(async () => {
      document.getElementById(this.pinLock ? "pin" : "masterPassword").focus();
      if (this.biometricLock && !disableAutoBiometricsPrompt && this.isInitialLockScreen) {
        if (await this.vaultTimeoutService.isLocked()) {
          await this.unlockBiometric();
        }
      }
    }, 100);
  }

  async unlockBiometric(): Promise<boolean> {
    if (!this.biometricLock) {
      return;
    }

    this.pendingBiometric = true;
    this.biometricError = null;

    let success;
    try {
      success = await super.unlockBiometric();
    } catch (e) {
      const error = BiometricErrors[e as BiometricErrorTypes];

      if (error == null) {
        this.logService.error("Unknown error: " + e);
      }

      this.biometricError = this.i18nService.t(error.description);
    }
    this.pendingBiometric = false;

    return success;
  }
}
