import { Directive } from "@angular/core";
import { Router } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { VerificationType } from "@bitwarden/common/enums/verificationType";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/models/domain/master-password-policy-options";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { PasswordRequest } from "@bitwarden/common/models/request/password.request";
import { Verification } from "@bitwarden/common/types/verification";

import { ChangePasswordComponent as BaseChangePasswordComponent } from "./change-password.component";

@Directive()
export class UpdatePasswordComponent extends BaseChangePasswordComponent {
  hint: string;
  key: string;
  enforcedPolicyOptions: MasterPasswordPolicyOptions;
  showPassword = false;
  currentMasterPassword: string;

  onSuccessfulChangePassword: () => Promise<void>;

  constructor(
    protected router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    passwordGenerationService: PasswordGenerationService,
    policyService: PolicyService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    private apiService: ApiService,
    stateService: StateService,
    private userVerificationService: UserVerificationService,
    private logService: LogService
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyService,
      stateService
    );
  }

  togglePassword(confirmField: boolean) {
    this.showPassword = !this.showPassword;
    document.getElementById(confirmField ? "masterPasswordRetype" : "masterPassword").focus();
  }

  async cancel() {
    await this.stateService.setOrganizationInvitation(null);
    this.router.navigate(["/vault"]);
  }

  async setupSubmitActions(): Promise<boolean> {
    if (this.currentMasterPassword == null || this.currentMasterPassword === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordRequired")
      );
      return false;
    }

    const secret: Verification = {
      type: VerificationType.MasterPassword,
      secret: this.currentMasterPassword,
    };
    try {
      await this.userVerificationService.verifyUser(secret);
    } catch (e) {
      this.platformUtilsService.showToast("error", this.i18nService.t("errorOccurred"), e.message);
      return false;
    }

    this.kdf = await this.stateService.getKdfType();
    this.kdfIterations = await this.stateService.getKdfIterations();
    return true;
  }

  async performSubmitActions(
    masterPasswordHash: string,
    key: SymmetricCryptoKey,
    encKey: [SymmetricCryptoKey, EncString]
  ) {
    try {
      // Create Request
      const request = new PasswordRequest();
      request.masterPasswordHash = await this.cryptoService.hashPassword(
        this.currentMasterPassword,
        null
      );
      request.newMasterPasswordHash = masterPasswordHash;
      request.key = encKey[1].encryptedString;

      // Update user's password
      this.apiService.postPassword(request);

      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("masterPasswordChanged"),
        this.i18nService.t("logBackIn")
      );

      if (this.onSuccessfulChangePassword != null) {
        this.onSuccessfulChangePassword();
      } else {
        this.messagingService.send("logout");
      }
    } catch (e) {
      this.logService.error(e);
    }
  }
}
