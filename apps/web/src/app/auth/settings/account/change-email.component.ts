import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { EmailTokenRequest } from "@bitwarden/common/auth/models/request/email-token.request";
import { EmailRequest } from "@bitwarden/common/auth/models/request/email.request";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Component({
  selector: "app-change-email",
  templateUrl: "change-email.component.html",
})
export class ChangeEmailComponent implements OnInit {
  tokenSent = false;
  showTwoFactorEmailWarning = false;

  protected formGroup = this.formBuilder.group({
    step1: this.formBuilder.group({
      masterPassword: ["", [Validators.required]],
      newEmail: ["", [Validators.required, Validators.email]],
    }),
    token: [{ value: "", disabled: true }, [Validators.required]],
  });

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private messagingService: MessagingService,
    private logService: LogService,
    private stateService: StateService,
    private formBuilder: FormBuilder,
  ) {}

  async ngOnInit() {
    const twoFactorProviders = await this.apiService.getTwoFactorProviders();
    this.showTwoFactorEmailWarning = twoFactorProviders.data.some(
      (p) => p.type === TwoFactorProviderType.Email && p.enabled,
    );
  }

  protected submit = async () => {
    // This form has multiple steps, so we need to mark all the groups as touched.
    this.formGroup.controls.step1.markAllAsTouched();

    if (this.tokenSent) {
      this.formGroup.controls.token.markAllAsTouched();
    }

    // Exit if the form is invalid.
    if (this.formGroup.invalid) {
      return;
    }

    const step1Value = this.formGroup.controls.step1.value;
    const newEmail = step1Value.newEmail.trim().toLowerCase();

    if (!this.tokenSent) {
      const request = new EmailTokenRequest();
      request.newEmail = newEmail;
      request.masterPasswordHash = await this.cryptoService.hashMasterKey(
        step1Value.masterPassword,
        await this.cryptoService.getOrDeriveMasterKey(step1Value.masterPassword),
      );
      try {
        await this.apiService.postEmailToken(request);
        this.activateStep2();
      } catch (e) {
        this.logService.error(e);
      }
    } else {
      const request = new EmailRequest();
      request.token = this.formGroup.value.token;
      request.newEmail = newEmail;
      request.masterPasswordHash = await this.cryptoService.hashMasterKey(
        step1Value.masterPassword,
        await this.cryptoService.getOrDeriveMasterKey(step1Value.masterPassword),
      );
      const kdf = await this.stateService.getKdfType();
      const kdfConfig = await this.stateService.getKdfConfig();
      const newMasterKey = await this.cryptoService.makeMasterKey(
        step1Value.masterPassword,
        newEmail,
        kdf,
        kdfConfig,
      );
      request.newMasterPasswordHash = await this.cryptoService.hashMasterKey(
        step1Value.masterPassword,
        newMasterKey,
      );
      const newUserKey = await this.cryptoService.encryptUserKeyWithMasterKey(newMasterKey);
      request.key = newUserKey[1].encryptedString;
      try {
        await this.apiService.postEmail(request);
        this.reset();
        this.platformUtilsService.showToast(
          "success",
          this.i18nService.t("emailChanged"),
          this.i18nService.t("logBackIn"),
        );
        this.messagingService.send("logout");
      } catch (e) {
        this.logService.error(e);
      }
    }
  };

  // Disable step1 and enable token
  activateStep2() {
    this.formGroup.controls.step1.disable();
    this.formGroup.controls.token.enable();

    this.tokenSent = true;
  }

  // Reset form and re-enable step1
  reset() {
    this.formGroup.reset();
    this.formGroup.controls.step1.enable();
    this.formGroup.controls.token.disable();

    this.tokenSent = false;
  }
}
