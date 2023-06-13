import { Directive, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, Subject } from "rxjs";
import { concatMap, take, takeUntil } from "rxjs/operators";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { InternalPolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/admin-console/models/domain/master-password-policy-options";
import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { ForceResetPasswordReason } from "@bitwarden/common/auth/models/domain/force-reset-password-reason";
import { SecretVerificationRequest } from "@bitwarden/common/auth/models/request/secret-verification.request";
import { MasterPasswordPolicyResponse } from "@bitwarden/common/auth/models/response/master-password-policy.response";
import { HashPurpose, KeySuffixOptions } from "@bitwarden/common/enums";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";

import { DialogServiceAbstraction, SimpleDialogType } from "../../services/dialog";

@Directive()
export class LockComponent implements OnInit, OnDestroy {
  masterPassword = "";
  pin = "";
  showPassword = false;
  email: string;
  pinLock = false;
  webVaultHostname = "";
  formPromise: Promise<MasterPasswordPolicyResponse>;
  supportsBiometric: boolean;
  biometricLock: boolean;
  biometricText: string;
  hideInput: boolean;

  protected successRoute = "vault";
  protected forcePasswordResetRoute = "update-temp-password";
  protected onSuccessfulSubmit: () => Promise<void>;

  private invalidPinAttempts = 0;
  private pinSet: [boolean, boolean];

  private enforcedMasterPasswordOptions: MasterPasswordPolicyOptions = undefined;

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
    protected ngZone: NgZone,
    protected policyApiService: PolicyApiServiceAbstraction,
    protected policyService: InternalPolicyService,
    protected passwordStrengthService: PasswordStrengthServiceAbstraction,
    protected dialogService: DialogServiceAbstraction
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
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "logOut" },
      content: { key: "logOutConfirmation" },
      acceptButtonText: { key: "logOut" },
      type: SimpleDialogType.WARNING,
    });

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
      await this.doContinue(false);
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
        const response = await this.formPromise;
        this.enforcedMasterPasswordOptions = MasterPasswordPolicyOptions.fromResponse(response);
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
    await this.setKeyAndContinue(key, true);
  }
  private async setKeyAndContinue(key: SymmetricCryptoKey, evaluatePasswordAfterUnlock = false) {
    await this.cryptoService.setKey(key);
    await this.doContinue(evaluatePasswordAfterUnlock);
  }

  private async doContinue(evaluatePasswordAfterUnlock: boolean) {
    await this.stateService.setEverBeenUnlocked(true);
    this.messagingService.send("unlocked");

    if (evaluatePasswordAfterUnlock) {
      try {
        // If we do not have any saved policies, attempt to load them from the service
        if (this.enforcedMasterPasswordOptions == undefined) {
          this.enforcedMasterPasswordOptions = await firstValueFrom(
            this.policyService.masterPasswordPolicyOptions$()
          );
        }

        if (this.requirePasswordChange()) {
          await this.stateService.setForcePasswordResetReason(
            ForceResetPasswordReason.WeakMasterPassword
          );
          this.router.navigate([this.forcePasswordResetRoute]);
          return;
        }
      } catch (e) {
        // Do not prevent unlock if there is an error evaluating policies
        this.logService.error(e);
      }
    }

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

  /**
   * Checks if the master password meets the enforced policy requirements
   * If not, returns false
   */
  private requirePasswordChange(): boolean {
    if (
      this.enforcedMasterPasswordOptions == undefined ||
      !this.enforcedMasterPasswordOptions.enforceOnLogin
    ) {
      return false;
    }

    const passwordStrength = this.passwordStrengthService.getPasswordStrength(
      this.masterPassword,
      this.email
    )?.score;

    return !this.policyService.evaluateMasterPassword(
      passwordStrength,
      this.masterPassword,
      this.enforcedMasterPasswordOptions
    );
  }
}
