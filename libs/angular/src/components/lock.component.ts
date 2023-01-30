import { Directive, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { concatMap, take, takeUntil } from "rxjs/operators";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { HashPurpose } from "@bitwarden/common/enums/hashPurpose";
import { KeySuffixOptions } from "@bitwarden/common/enums/keySuffixOptions";
import { Utils } from "@bitwarden/common/misc/utils";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { SecretVerificationRequest } from "@bitwarden/common/models/request/secret-verification.request";

@Directive()
export class LockComponent implements OnInit, OnDestroy {
  masterPassword = "";
  pin = "";
  showPassword = false;
  email: string;
  pinLock = false;
  webVaultHostname = "";
  formPromise: Promise<any>;
  supportsBiometric: boolean;
  biometricLock: boolean;
  biometricText: string;
  hideInput: boolean;

  protected successRoute = "vault";
  protected onSuccessfulSubmit: () => Promise<void>;

  private invalidPinAttempts = 0;
  private pinSet: [boolean, boolean];

  private destroy$ = new Subject<void>();

  constructor(
    protected router: Router,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected messagingService: MessagingService,
    protected cryptoService: CryptoService,
    protected vaultTimeoutService: VaultTimeoutService,
    protected vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    protected environmentService: EnvironmentService,
    protected stateService: StateService,
    protected apiService: ApiService,
    protected logService: LogService,
    private keyConnectorService: KeyConnectorService,
    protected ngZone: NgZone
  ) {}

  async ngOnInit() {
    this.stateService.activeAccount$
      .pipe(
        concatMap(async () => {
          await this.load();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async submit() {
    if (this.pinLock) {
      return await this.handlePinRequiredUnlock();
    }

    await this.handleMasterPasswordRequiredUnlock();
  }

  async logOut() {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("logOutConfirmation"),
      this.i18nService.t("logOut"),
      this.i18nService.t("logOut"),
      this.i18nService.t("cancel")
    );
    if (confirmed) {
      this.messagingService.send("logout");
    }
  }

  async unlockBiometric(): Promise<boolean> {
    if (!this.biometricLock) {
      return;
    }

    const success = (await this.cryptoService.getKey(KeySuffixOptions.Biometric)) != null;

    if (success) {
      await this.doContinue();
    }

    return success;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    const input = document.getElementById(this.pinLock ? "pin" : "masterPassword");
    if (this.ngZone.isStable) {
      input.focus();
    } else {
      this.ngZone.onStable.pipe(take(1)).subscribe(() => input.focus());
    }
  }

  private async handlePinRequiredUnlock() {
    if (this.pin == null || this.pin === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("pinRequired")
      );
      return;
    }

    return await this.doUnlockWithPin();
  }

  private async doUnlockWithPin() {
    let failed = true;
    try {
      const kdf = await this.stateService.getKdfType();
      const kdfConfig = await this.stateService.getKdfConfig();
      if (this.pinSet[0]) {
        const key = await this.cryptoService.makeKeyFromPin(
          this.pin,
          this.email,
          kdf,
          kdfConfig,
          await this.stateService.getDecryptedPinProtected()
        );
        const encKey = await this.cryptoService.getEncKey(key);
        const protectedPin = await this.stateService.getProtectedPin();
        const decPin = await this.cryptoService.decryptToUtf8(new EncString(protectedPin), encKey);
        failed = decPin !== this.pin;
        if (!failed) {
          await this.setKeyAndContinue(key);
        }
      } else {
        const key = await this.cryptoService.makeKeyFromPin(this.pin, this.email, kdf, kdfConfig);
        failed = false;
        await this.setKeyAndContinue(key);
      }
    } catch {
      failed = true;
    }

    if (failed) {
      this.invalidPinAttempts++;
      if (this.invalidPinAttempts >= 5) {
        this.messagingService.send("logout");
        return;
      }
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("invalidPin")
      );
    }
  }

  private async handleMasterPasswordRequiredUnlock() {
    if (this.masterPassword == null || this.masterPassword === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordRequired")
      );
      return;
    }
    await this.doUnlockWithMasterPassword();
  }

  private async doUnlockWithMasterPassword() {
    const kdf = await this.stateService.getKdfType();
    const kdfConfig = await this.stateService.getKdfConfig();

    const key = await this.cryptoService.makeKey(this.masterPassword, this.email, kdf, kdfConfig);
    const storedKeyHash = await this.cryptoService.getKeyHash();

    let passwordValid = false;

    if (storedKeyHash != null) {
      passwordValid = await this.cryptoService.compareAndUpdateKeyHash(this.masterPassword, key);
    } else {
      const request = new SecretVerificationRequest();
      const serverKeyHash = await this.cryptoService.hashPassword(
        this.masterPassword,
        key,
        HashPurpose.ServerAuthorization
      );
      request.masterPasswordHash = serverKeyHash;
      try {
        this.formPromise = this.apiService.postAccountVerifyPassword(request);
        await this.formPromise;
        passwordValid = true;
        const localKeyHash = await this.cryptoService.hashPassword(
          this.masterPassword,
          key,
          HashPurpose.LocalAuthorization
        );
        await this.cryptoService.setKeyHash(localKeyHash);
      } catch (e) {
        this.logService.error(e);
      }
    }

    if (!passwordValid) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("invalidMasterPassword")
      );
      return;
    }

    if (this.pinSet[0]) {
      const protectedPin = await this.stateService.getProtectedPin();
      const encKey = await this.cryptoService.getEncKey(key);
      const decPin = await this.cryptoService.decryptToUtf8(new EncString(protectedPin), encKey);
      const pinKey = await this.cryptoService.makePinKey(decPin, this.email, kdf, kdfConfig);
      await this.stateService.setDecryptedPinProtected(
        await this.cryptoService.encrypt(key.key, pinKey)
      );
    }
    await this.setKeyAndContinue(key);
  }
  private async setKeyAndContinue(key: SymmetricCryptoKey) {
    await this.cryptoService.setKey(key);
    await this.doContinue();
  }

  private async doContinue() {
    await this.stateService.setEverBeenUnlocked(true);
    const disableFavicon = await this.stateService.getDisableFavicon();
    await this.stateService.setDisableFavicon(!!disableFavicon);
    this.messagingService.send("unlocked");
    if (this.onSuccessfulSubmit != null) {
      await this.onSuccessfulSubmit();
    } else if (this.router != null) {
      this.router.navigate([this.successRoute]);
    }
  }

  private async load() {
    this.pinSet = await this.vaultTimeoutSettingsService.isPinLockSet();
    this.pinLock =
      (this.pinSet[0] && (await this.stateService.getDecryptedPinProtected()) != null) ||
      this.pinSet[1];
    this.supportsBiometric = await this.platformUtilsService.supportsBiometric();
    this.biometricLock =
      (await this.vaultTimeoutSettingsService.isBiometricLockSet()) &&
      ((await this.cryptoService.hasKeyStored(KeySuffixOptions.Biometric)) ||
        !this.platformUtilsService.supportsSecureStorage());
    this.biometricText = await this.stateService.getBiometricText();
    this.email = await this.stateService.getEmail();
    const usesKeyConnector = await this.keyConnectorService.getUsesKeyConnector();
    this.hideInput = usesKeyConnector && !this.pinLock;

    // Users with key connector and without biometric or pin has no MP to unlock using
    if (usesKeyConnector && !(this.biometricLock || this.pinLock)) {
      await this.vaultTimeoutService.logOut();
    }

    const webVaultUrl = this.environmentService.getWebVaultUrl();
    const vaultUrl =
      webVaultUrl === "https://vault.bitwarden.com" ? "https://bitwarden.com" : webVaultUrl;
    this.webVaultHostname = Utils.getHostname(vaultUrl);
  }
}
