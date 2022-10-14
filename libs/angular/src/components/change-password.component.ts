import { Directive, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { KdfType } from "@bitwarden/common/enums/kdfType";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/models/domain/master-password-policy-options";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";

import { PasswordColorText } from "../shared/components/password-strength/password-strength.component";

@Directive()
export class ChangePasswordComponent implements OnInit, OnDestroy {
  masterPassword: string;
  masterPasswordRetype: string;
  formPromise: Promise<any>;
  enforcedPolicyOptions: MasterPasswordPolicyOptions;
  passwordStrengthResult: any;
  color: string;
  text: string;

  protected email: string;
  protected kdf: KdfType;
  protected kdfIterations: number;

  protected destroy$ = new Subject<void>();

  constructor(
    protected i18nService: I18nService,
    protected cryptoService: CryptoService,
    protected messagingService: MessagingService,
    protected passwordGenerationService: PasswordGenerationService,
    protected platformUtilsService: PlatformUtilsService,
    protected policyService: PolicyService,
    protected stateService: StateService
  ) {}

  async ngOnInit() {
    this.email = await this.stateService.getEmail();
    this.policyService
      .masterPasswordPolicyOptions$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (enforcedPasswordPolicyOptions) =>
          (this.enforcedPolicyOptions ??= enforcedPasswordPolicyOptions)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async submit() {
    if (!(await this.strongPassword())) {
      return;
    }

    if (!(await this.setupSubmitActions())) {
      return;
    }

    const email = await this.stateService.getEmail();
    if (this.kdf == null) {
      this.kdf = await this.stateService.getKdfType();
    }
    if (this.kdfIterations == null) {
      this.kdfIterations = await this.stateService.getKdfIterations();
    }
    const key = await this.cryptoService.makeKey(
      this.masterPassword,
      email.trim().toLowerCase(),
      this.kdf,
      this.kdfIterations
    );
    const masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, key);

    let encKey: [SymmetricCryptoKey, EncString] = null;
    const existingEncKey = await this.cryptoService.getEncKey();
    if (existingEncKey == null) {
      encKey = await this.cryptoService.makeEncKey(key);
    } else {
      encKey = await this.cryptoService.remakeEncKey(key);
    }

    await this.performSubmitActions(masterPasswordHash, key, encKey);
  }

  async setupSubmitActions(): Promise<boolean> {
    // Override in sub-class
    // Can be used for additional validation and/or other processes the should occur before changing passwords
    return true;
  }

  async performSubmitActions(
    masterPasswordHash: string,
    key: SymmetricCryptoKey,
    encKey: [SymmetricCryptoKey, EncString]
  ) {
    // Override in sub-class
  }

  async strongPassword(): Promise<boolean> {
    if (this.masterPassword == null || this.masterPassword === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordRequired")
      );
      return false;
    }
    if (this.masterPassword.length < 8) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordMinlength")
      );
      return false;
    }
    if (this.masterPassword !== this.masterPasswordRetype) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPassDoesntMatch")
      );
      return false;
    }

    const strengthResult = this.passwordStrengthResult;

    if (
      this.enforcedPolicyOptions != null &&
      !this.policyService.evaluateMasterPassword(
        strengthResult.score,
        this.masterPassword,
        this.enforcedPolicyOptions
      )
    ) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordPolicyRequirementsNotMet")
      );
      return false;
    }

    if (strengthResult != null && strengthResult.score < 3) {
      const result = await this.platformUtilsService.showDialog(
        this.i18nService.t("weakMasterPasswordDesc"),
        this.i18nService.t("weakMasterPassword"),
        this.i18nService.t("yes"),
        this.i18nService.t("no"),
        "warning"
      );
      if (!result) {
        return false;
      }
    }

    return true;
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

  getStrengthResult(result: any) {
    this.passwordStrengthResult = result;
  }

  getPasswordScoreText(event: PasswordColorText) {
    this.color = event.color;
    this.text = event.text;
  }
}
