import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { concatMap, debounceTime, filter, map, takeUntil, tap } from "rxjs/operators";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AbstractThemingService } from "@bitwarden/angular/services/theming/theming.service.abstraction";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { DeviceType, ThemeType, StorageLocation } from "@bitwarden/common/enums";
import { VaultTimeoutAction } from "@bitwarden/common/enums/vault-timeout-action.enum";
import { Utils } from "@bitwarden/common/misc/utils";

import { flagEnabled } from "../../flags";
import { isWindowsStore } from "../../utils";
import { SetPinComponent } from "../components/set-pin.component";

@Component({
  selector: "app-settings",
  templateUrl: "settings.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class SettingsComponent implements OnInit {
  // For use in template
  protected readonly VaultTimeoutAction = VaultTimeoutAction;

  showMinToTray = false;
  vaultTimeoutOptions: any[];
  localeOptions: any[];
  themeOptions: any[];
  clearClipboardOptions: any[];
  supportsBiometric: boolean;
  biometricText: string;
  autoPromptBiometricsText: string;
  showAlwaysShowDock = false;
  requireEnableTray = false;
  showDuckDuckGoIntegrationOption = false;

  enableTrayText: string;
  enableTrayDescText: string;
  enableMinToTrayText: string;
  enableMinToTrayDescText: string;
  enableCloseToTrayText: string;
  enableCloseToTrayDescText: string;
  startToTrayText: string;
  startToTrayDescText: string;

  showSecurity = true;
  showAccountPreferences = true;
  showAppPreferences = true;

  currentUserEmail: string;

  vaultTimeoutPolicyCallout: Observable<{
    timeout: { hours: number; minutes: number };
    action: "lock" | "logOut";
  }>;
  previousVaultTimeout: number = null;

  form = this.formBuilder.group({
    // Security
    vaultTimeout: [null as number | null],
    vaultTimeoutAction: [VaultTimeoutAction.Lock],
    pin: [null as boolean | null],
    biometric: false,
    autoPromptBiometrics: false,
    approveLoginRequests: false,
    // Account Preferences
    clearClipboard: [null as number | null],
    minimizeOnCopyToClipboard: false,
    enableFavicons: false,
    // App Settings
    enableTray: false,
    enableMinToTray: false,
    enableCloseToTray: false,
    startToTray: false,
    openAtLogin: false,
    alwaysShowDock: false,
    enableBrowserIntegration: false,
    enableBrowserIntegrationFingerprint: this.formBuilder.control<boolean>({
      value: false,
      disabled: true,
    }),
    enableDuckDuckGoBrowserIntegration: false,
    theme: [null as ThemeType | null],
    locale: [null as string | null],
  });

  private destroy$ = new Subject<void>();

  constructor(
    private policyService: PolicyService,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    private stateService: StateService,
    private messagingService: MessagingService,
    private cryptoService: CryptoService,
    private modalService: ModalService,
    private themingService: AbstractThemingService
  ) {
    const isMac = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;

    // Workaround to avoid ghosting trays https://github.com/electron/electron/issues/17622
    this.requireEnableTray = this.platformUtilsService.getDevice() === DeviceType.LinuxDesktop;

    const trayKey = isMac ? "enableMenuBar" : "enableTray";
    this.enableTrayText = this.i18nService.t(trayKey);
    this.enableTrayDescText = this.i18nService.t(trayKey + "Desc");

    const minToTrayKey = isMac ? "enableMinToMenuBar" : "enableMinToTray";
    this.enableMinToTrayText = this.i18nService.t(minToTrayKey);
    this.enableMinToTrayDescText = this.i18nService.t(minToTrayKey + "Desc");

    const closeToTrayKey = isMac ? "enableCloseToMenuBar" : "enableCloseToTray";
    this.enableCloseToTrayText = this.i18nService.t(closeToTrayKey);
    this.enableCloseToTrayDescText = this.i18nService.t(closeToTrayKey + "Desc");

    const startToTrayKey = isMac ? "startToMenuBar" : "startToTray";
    this.startToTrayText = this.i18nService.t(startToTrayKey);
    this.startToTrayDescText = this.i18nService.t(startToTrayKey + "Desc");

    // DuckDuckGo browser is only for macos initially
    this.showDuckDuckGoIntegrationOption = flagEnabled("showDDGSetting") && isMac;

    this.vaultTimeoutOptions = [
      // { name: i18nService.t('immediately'), value: 0 },
      { name: this.i18nService.t("oneMinute"), value: 1 },
      { name: this.i18nService.t("fiveMinutes"), value: 5 },
      { name: this.i18nService.t("fifteenMinutes"), value: 15 },
      { name: this.i18nService.t("thirtyMinutes"), value: 30 },
      { name: this.i18nService.t("oneHour"), value: 60 },
      { name: this.i18nService.t("fourHours"), value: 240 },
      { name: this.i18nService.t("onIdle"), value: -4 },
      { name: this.i18nService.t("onSleep"), value: -3 },
    ];

    if (this.platformUtilsService.getDevice() !== DeviceType.LinuxDesktop) {
      this.vaultTimeoutOptions.push({ name: this.i18nService.t("onLocked"), value: -2 });
    }

    this.vaultTimeoutOptions = this.vaultTimeoutOptions.concat([
      { name: this.i18nService.t("onRestart"), value: -1 },
      { name: this.i18nService.t("never"), value: null },
    ]);

    const localeOptions: any[] = [];
    this.i18nService.supportedTranslationLocales.forEach((locale) => {
      let name = locale;
      if (this.i18nService.localeNames.has(locale)) {
        name += " - " + this.i18nService.localeNames.get(locale);
      }
      localeOptions.push({ name: name, value: locale });
    });
    localeOptions.sort(Utils.getSortFunction(this.i18nService, "name"));
    localeOptions.splice(0, 0, { name: this.i18nService.t("default"), value: null });
    this.localeOptions = localeOptions;

    this.themeOptions = [
      { name: this.i18nService.t("default"), value: ThemeType.System },
      { name: this.i18nService.t("light"), value: ThemeType.Light },
      { name: this.i18nService.t("dark"), value: ThemeType.Dark },
      { name: "Nord", value: ThemeType.Nord },
    ];

    this.clearClipboardOptions = [
      { name: this.i18nService.t("never"), value: null },
      { name: this.i18nService.t("tenSeconds"), value: 10 },
      { name: this.i18nService.t("twentySeconds"), value: 20 },
      { name: this.i18nService.t("thirtySeconds"), value: 30 },
      { name: this.i18nService.t("oneMinute"), value: 60 },
      { name: this.i18nService.t("twoMinutes"), value: 120 },
      { name: this.i18nService.t("fiveMinutes"), value: 300 },
    ];
  }

  async ngOnInit() {
    if ((await this.stateService.getUserId()) == null) {
      return;
    }
    this.currentUserEmail = await this.stateService.getEmail();

    // Load timeout policy
    this.vaultTimeoutPolicyCallout = this.policyService.get$(PolicyType.MaximumVaultTimeout).pipe(
      filter((policy) => policy != null),
      map((policy) => {
        let timeout;
        if (policy.data?.minutes) {
          timeout = {
            hours: Math.floor(policy.data?.minutes / 60),
            minutes: policy.data?.minutes % 60,
          };
        }
        return { timeout: timeout, action: policy.data?.action };
      }),
      tap((policy) => {
        if (policy.action) {
          this.form.controls.vaultTimeoutAction.disable({ emitEvent: false });
        } else {
          this.form.controls.vaultTimeoutAction.enable({ emitEvent: false });
        }
      })
    );

    // Load initial values
    const pinSet = await this.vaultTimeoutSettingsService.isPinLockSet();
    const initialValues = {
      vaultTimeout: await this.vaultTimeoutSettingsService.getVaultTimeout(),
      vaultTimeoutAction: await this.vaultTimeoutSettingsService.getVaultTimeoutAction(),
      pin: pinSet[0] || pinSet[1],
      biometric: await this.vaultTimeoutSettingsService.isBiometricLockSet(),
      autoPromptBiometrics: !(await this.stateService.getNoAutoPromptBiometrics()),
      approveLoginRequests: (await this.stateService.getApproveLoginRequests()) ?? false,
      clearClipboard: await this.stateService.getClearClipboard(),
      minimizeOnCopyToClipboard: await this.stateService.getMinimizeOnCopyToClipboard(),
      enableFavicons: !(await this.stateService.getDisableFavicon()),
      enableTray: await this.stateService.getEnableTray(),
      enableMinToTray: await this.stateService.getEnableMinimizeToTray(),
      enableCloseToTray: await this.stateService.getEnableCloseToTray(),
      startToTray: await this.stateService.getEnableStartToTray(),
      openAtLogin: await this.stateService.getOpenAtLogin(),
      alwaysShowDock: await this.stateService.getAlwaysShowDock(),
      enableBrowserIntegration: await this.stateService.getEnableBrowserIntegration(),
      enableBrowserIntegrationFingerprint:
        await this.stateService.getEnableBrowserIntegrationFingerprint(),
      enableDuckDuckGoBrowserIntegration:
        await this.stateService.getEnableDuckDuckGoBrowserIntegration(),
      theme: await this.stateService.getTheme(),
      locale: (await this.stateService.getLocale()) ?? null,
    };
    this.form.setValue(initialValues, { emitEvent: false });

    if (this.form.value.enableBrowserIntegration) {
      this.form.controls.enableBrowserIntegrationFingerprint.enable();
    }

    // Non-form values
    this.showMinToTray = this.platformUtilsService.getDevice() !== DeviceType.LinuxDesktop;
    this.showAlwaysShowDock = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;
    this.supportsBiometric = await this.platformUtilsService.supportsBiometric();
    this.biometricText = await this.stateService.getBiometricText();
    this.autoPromptBiometricsText = await this.stateService.getNoAutoPromptBiometricsText();
    this.previousVaultTimeout = this.form.value.vaultTimeout;

    // Form events
    this.form.controls.vaultTimeout.valueChanges
      .pipe(
        debounceTime(500),
        concatMap(async (value) => {
          await this.saveVaultTimeout(value);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.form.controls.vaultTimeoutAction.valueChanges
      .pipe(
        concatMap(async (action) => {
          await this.saveVaultTimeoutAction(action);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.form.controls.enableBrowserIntegration.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((enabled) => {
        if (enabled) {
          this.form.controls.enableBrowserIntegrationFingerprint.enable();
        } else {
          this.form.controls.enableBrowserIntegrationFingerprint.disable();
        }
      });
  }

  async saveVaultTimeout(newValue: number) {
    if (newValue == null) {
      const confirmed = await this.platformUtilsService.showDialog(
        this.i18nService.t("neverLockWarning"),
        "",
        this.i18nService.t("yes"),
        this.i18nService.t("cancel"),
        "warning"
      );
      if (!confirmed) {
        this.form.controls.vaultTimeout.setValue(this.previousVaultTimeout);
        return;
      }
    }

    // Avoid saving 0 since it's useless as a timeout value.
    if (this.form.value.vaultTimeout === 0) {
      return;
    }

    if (!this.form.controls.vaultTimeout.valid) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("vaultTimeoutTooLarge")
      );
      return;
    }

    this.previousVaultTimeout = this.form.value.vaultTimeout;

    await this.vaultTimeoutSettingsService.setVaultTimeoutOptions(
      newValue,
      this.form.value.vaultTimeoutAction
    );
  }

  async saveVaultTimeoutAction(newValue: VaultTimeoutAction) {
    if (newValue === "logOut") {
      const confirmed = await this.platformUtilsService.showDialog(
        this.i18nService.t("vaultTimeoutLogOutConfirmation"),
        this.i18nService.t("vaultTimeoutLogOutConfirmationTitle"),
        this.i18nService.t("yes"),
        this.i18nService.t("cancel"),
        "warning"
      );
      if (!confirmed) {
        this.form.controls.vaultTimeoutAction.patchValue(VaultTimeoutAction.Lock, {
          emitEvent: false,
        });
        return;
      }
    }

    if (this.form.controls.vaultTimeout.hasError("policyError")) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("vaultTimeoutTooLarge")
      );
      return;
    }

    await this.vaultTimeoutSettingsService.setVaultTimeoutOptions(
      this.form.value.vaultTimeout,
      newValue
    );
  }

  async updatePin() {
    if (this.form.value.pin) {
      const ref = this.modalService.open(SetPinComponent, { allowMultipleModals: true });

      if (ref == null) {
        this.form.controls.pin.setValue(false);
        return;
      }

      this.form.controls.pin.setValue(await ref.onClosedPromise());
    }
    if (!this.form.value.pin) {
      await this.cryptoService.clearPinProtectedKey();
      await this.vaultTimeoutSettingsService.clear();
    }
  }

  async updateBiometric() {
    // NOTE: A bug in angular causes [ngModel] to not reflect the backing field value
    // causing the checkbox to remain checked even if authentication fails.
    // The bug should resolve itself once the angular issue is resolved.
    // See: https://github.com/angular/angular/issues/13063

    if (!this.form.value.biometric || !this.supportsBiometric) {
      this.form.controls.biometric.setValue(false);
      await this.stateService.setBiometricUnlock(null);
      await this.cryptoService.toggleKey();
      return;
    }

    const authResult = await this.platformUtilsService.authenticateBiometric();

    if (!authResult) {
      this.form.controls.biometric.setValue(false);
      return;
    }

    this.form.controls.biometric.setValue(true);
    await this.stateService.setBiometricUnlock(true);
    await this.cryptoService.toggleKey();
  }

  async updateAutoPromptBiometrics() {
    if (this.form.value.autoPromptBiometrics) {
      await this.stateService.setNoAutoPromptBiometrics(null);
    } else {
      await this.stateService.setNoAutoPromptBiometrics(true);
    }
  }

  async saveFavicons() {
    await this.stateService.setDisableFavicon(!this.form.value.enableFavicons);
    await this.stateService.setDisableFavicon(!this.form.value.enableFavicons, {
      storageLocation: StorageLocation.Disk,
    });
    this.messagingService.send("refreshCiphers");
  }

  async saveMinToTray() {
    await this.stateService.setEnableMinimizeToTray(this.form.value.enableMinToTray);
  }

  async saveCloseToTray() {
    if (this.requireEnableTray) {
      this.form.controls.enableTray.setValue(true);
      await this.stateService.setEnableTray(this.form.value.enableTray);
    }

    await this.stateService.setEnableCloseToTray(this.form.value.enableCloseToTray);
  }

  async saveTray() {
    if (
      this.requireEnableTray &&
      !this.form.value.enableTray &&
      (this.form.value.startToTray || this.form.value.enableCloseToTray)
    ) {
      const confirm = await this.platformUtilsService.showDialog(
        this.i18nService.t("confirmTrayDesc"),
        this.i18nService.t("confirmTrayTitle"),
        this.i18nService.t("yes"),
        this.i18nService.t("no"),
        "warning"
      );

      if (confirm) {
        this.form.controls.startToTray.setValue(false, { emitEvent: false });
        await this.stateService.setEnableStartToTray(this.form.value.startToTray);
        this.form.controls.enableCloseToTray.setValue(false, { emitEvent: false });
        await this.stateService.setEnableCloseToTray(this.form.value.enableCloseToTray);
      } else {
        this.form.controls.enableTray.setValue(true);
      }

      return;
    }

    await this.stateService.setEnableTray(this.form.value.enableTray);
    this.messagingService.send(this.form.value.enableTray ? "showTray" : "removeTray");
  }

  async saveStartToTray() {
    if (this.requireEnableTray) {
      this.form.controls.enableTray.setValue(true);
      await this.stateService.setEnableTray(this.form.value.enableTray);
    }

    await this.stateService.setEnableStartToTray(this.form.value.startToTray);
  }

  async saveLocale() {
    await this.stateService.setLocale(this.form.value.locale);
  }

  async saveTheme() {
    await this.themingService.updateConfiguredTheme(this.form.value.theme);
  }

  async saveMinOnCopyToClipboard() {
    await this.stateService.setMinimizeOnCopyToClipboard(this.form.value.minimizeOnCopyToClipboard);
  }

  async saveClearClipboard() {
    await this.stateService.setClearClipboard(this.form.value.clearClipboard);
  }

  async saveAlwaysShowDock() {
    await this.stateService.setAlwaysShowDock(this.form.value.alwaysShowDock);
  }

  async saveOpenAtLogin() {
    this.stateService.setOpenAtLogin(this.form.value.openAtLogin);
    this.messagingService.send(
      this.form.value.openAtLogin ? "addOpenAtLogin" : "removeOpenAtLogin"
    );
  }

  async saveBrowserIntegration() {
    if (process.platform === "darwin" && !this.platformUtilsService.isMacAppStore()) {
      await this.platformUtilsService.showDialog(
        this.i18nService.t("browserIntegrationMasOnlyDesc"),
        this.i18nService.t("browserIntegrationUnsupportedTitle"),
        this.i18nService.t("ok"),
        null,
        "warning"
      );

      this.form.controls.enableBrowserIntegration.setValue(false);
      return;
    } else if (isWindowsStore()) {
      await this.platformUtilsService.showDialog(
        this.i18nService.t("browserIntegrationWindowsStoreDesc"),
        this.i18nService.t("browserIntegrationUnsupportedTitle"),
        this.i18nService.t("ok"),
        null,
        "warning"
      );

      this.form.controls.enableBrowserIntegration.setValue(false);
      return;
    } else if (process.platform == "linux") {
      await this.platformUtilsService.showDialog(
        this.i18nService.t("browserIntegrationLinuxDesc"),
        this.i18nService.t("browserIntegrationUnsupportedTitle"),
        this.i18nService.t("ok"),
        null,
        "warning"
      );

      this.form.controls.enableBrowserIntegration.setValue(false);
      return;
    }

    await this.stateService.setEnableBrowserIntegration(this.form.value.enableBrowserIntegration);
    this.messagingService.send(
      this.form.value.enableBrowserIntegration
        ? "enableBrowserIntegration"
        : "disableBrowserIntegration"
    );

    if (!this.form.value.enableBrowserIntegration) {
      this.form.controls.enableBrowserIntegrationFingerprint.setValue(false);
      this.saveBrowserIntegrationFingerprint();
    }
  }

  async saveDdgBrowserIntegration() {
    await this.stateService.setEnableDuckDuckGoBrowserIntegration(
      this.form.value.enableDuckDuckGoBrowserIntegration
    );

    if (!this.form.value.enableBrowserIntegration) {
      await this.stateService.setDuckDuckGoSharedKey(null);
    }

    this.messagingService.send(
      this.form.value.enableDuckDuckGoBrowserIntegration
        ? "enableDuckDuckGoBrowserIntegration"
        : "disableDuckDuckGoBrowserIntegration"
    );
  }

  async saveBrowserIntegrationFingerprint() {
    await this.stateService.setEnableBrowserIntegrationFingerprint(
      this.form.value.enableBrowserIntegrationFingerprint
    );
  }

  async updateApproveLoginRequests() {
    await this.stateService.setApproveLoginRequests(this.form.value.approveLoginRequests);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
