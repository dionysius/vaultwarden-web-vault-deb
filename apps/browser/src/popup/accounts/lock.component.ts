import { Component, NgZone } from "@angular/core";
import { Router } from "@angular/router";

import { LockComponent as BaseLockComponent } from "@bitwarden/angular/components/lock.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SyncService } from "@bitwarden/common/abstractions/sync/sync.service.abstraction";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";

import { BiometricErrors, BiometricErrorTypes } from "../../models/biometricErrors";

@Component({
  selector: "app-lock",
  templateUrl: "lock.component.html",
})
export class LockComponent extends BaseLockComponent {
  private isInitialLockScreen: boolean;

  biometricError: string;
  pendingBiometric = false;
  authenicatedUrl = "/tabs/current";
  unAuthenicatedUrl = "/update-temp-password";

  constructor(
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    cryptoService: CryptoService,
    vaultTimeoutService: VaultTimeoutService,
    vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    environmentService: EnvironmentService,
    stateService: StateService,
    apiService: ApiService,
    logService: LogService,
    keyConnectorService: KeyConnectorService,
    ngZone: NgZone,
    private authService: AuthService,
    private syncService: SyncService
  ) {
    super(
      router,
      i18nService,
      platformUtilsService,
      messagingService,
      cryptoService,
      vaultTimeoutService,
      vaultTimeoutSettingsService,
      environmentService,
      stateService,
      apiService,
      logService,
      keyConnectorService,
      ngZone
    );

    this.isInitialLockScreen = (window as any).previousPopupUrl == null;
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.syncService.fullSync(true);

    const forcePasswordReset = await this.stateService.getForcePasswordReset();
    this.successRoute = forcePasswordReset === true ? this.unAuthenicatedUrl : this.authenicatedUrl;

    const disableAutoBiometricsPrompt =
      (await this.stateService.getDisableAutoBiometricsPrompt()) ?? true;

    window.setTimeout(async () => {
      document.getElementById(this.pinLock ? "pin" : "masterPassword").focus();
      if (
        this.biometricLock &&
        !disableAutoBiometricsPrompt &&
        this.isInitialLockScreen &&
        (await this.authService.getAuthStatus()) === AuthenticationStatus.Locked
      ) {
        await this.unlockBiometric();
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
