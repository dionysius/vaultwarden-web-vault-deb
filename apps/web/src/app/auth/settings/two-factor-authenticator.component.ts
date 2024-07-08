import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { firstValueFrom, map } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { UpdateTwoFactorAuthenticatorRequest } from "@bitwarden/common/auth/models/request/update-two-factor-authenticator.request";
import { TwoFactorAuthenticatorResponse } from "@bitwarden/common/auth/models/response/two-factor-authenticator.response";
import { AuthResponse } from "@bitwarden/common/auth/types/auth-response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DialogService } from "@bitwarden/components";

import { TwoFactorBaseComponent } from "./two-factor-base.component";

// NOTE: There are additional options available but these are just the ones we are current using.
// See: https://github.com/neocotic/qrious#examples
interface QRiousOptions {
  element: HTMLElement;
  value: string;
  size: number;
}

declare global {
  interface Window {
    QRious: new (options: QRiousOptions) => unknown;
  }
}

@Component({
  selector: "app-two-factor-authenticator",
  templateUrl: "two-factor-authenticator.component.html",
})
export class TwoFactorAuthenticatorComponent
  extends TwoFactorBaseComponent
  implements OnInit, OnDestroy
{
  @Output() onChangeStatus = new EventEmitter<boolean>();
  type = TwoFactorProviderType.Authenticator;
  key: string;

  override componentName = "app-two-factor-authenticator";
  qrScriptError = false;
  private qrScript: HTMLScriptElement;

  formGroup = this.formBuilder.group({
    token: new FormControl(null, [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    @Inject(DIALOG_DATA) protected data: AuthResponse<TwoFactorAuthenticatorResponse>,
    private dialogRef: DialogRef,
    apiService: ApiService,
    i18nService: I18nService,
    userVerificationService: UserVerificationService,
    private formBuilder: FormBuilder,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    private accountService: AccountService,
    dialogService: DialogService,
  ) {
    super(
      apiService,
      i18nService,
      platformUtilsService,
      logService,
      userVerificationService,
      dialogService,
    );
    this.qrScript = window.document.createElement("script");
    this.qrScript.src = "scripts/qrious.min.js";
    this.qrScript.async = true;
  }

  async ngOnInit() {
    window.document.body.appendChild(this.qrScript);
    await this.auth(this.data);
  }

  ngOnDestroy() {
    window.document.body.removeChild(this.qrScript);
  }

  validateTokenControl() {
    this.formGroup.controls.token.markAsTouched();
  }

  async auth(authResponse: AuthResponse<TwoFactorAuthenticatorResponse>) {
    super.auth(authResponse);
    return this.processResponse(authResponse.response);
  }

  submit = async () => {
    if (this.formGroup.invalid && !this.enabled) {
      return;
    }
    if (this.enabled) {
      await this.disableMethod();
      this.dialogRef.close(this.enabled);
    } else {
      await this.enable();
    }
    this.onChangeStatus.emit(this.enabled);
  };

  protected async enable() {
    const request = await this.buildRequestModel(UpdateTwoFactorAuthenticatorRequest);
    request.token = this.formGroup.value.token;
    request.key = this.key;

    const response = await this.apiService.putTwoFactorAuthenticator(request);
    await this.processResponse(response);
    this.onUpdated.emit(true);
  }

  private async processResponse(response: TwoFactorAuthenticatorResponse) {
    this.formGroup.get("token").setValue(null);
    this.enabled = response.enabled;
    this.key = response.key;

    await this.waitForQRiousToLoadOrError().catch((error) => {
      this.logService.error(error);
      this.qrScriptError = true;
    });

    await this.createQRCode();
  }

  private async waitForQRiousToLoadOrError(): Promise<void> {
    // Check if QRious is already loaded or if there was an error loading it either way don't wait for it to try and load again
    if (typeof window.QRious !== "undefined" || this.qrScriptError) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.qrScript.onload = () => resolve();
      this.qrScript.onerror = () =>
        reject(new Error(this.i18nService.t("twoStepAuthenticatorQRCanvasError")));
    });
  }

  private async createQRCode() {
    if (this.qrScriptError) {
      return;
    }
    const email = await firstValueFrom(
      this.accountService.activeAccount$.pipe(map((a) => a?.email)),
    );
    new window.QRious({
      element: document.getElementById("qr"),
      value:
        "otpauth://totp/Bitwarden:" +
        Utils.encodeRFC3986URIComponent(email) +
        "?secret=" +
        encodeURIComponent(this.key) +
        "&issuer=Bitwarden",
      size: 160,
    });
  }

  static open(
    dialogService: DialogService,
    config: DialogConfig<AuthResponse<TwoFactorAuthenticatorResponse>>,
  ) {
    return dialogService.open<boolean>(TwoFactorAuthenticatorComponent, config);
  }

  async launchExternalUrl(url: string) {
    const hostname = new URL(url).hostname;
    const confirmed = await this.dialogService.openSimpleDialog({
      title: this.i18nService.t("continueToExternalUrlTitle", hostname),
      content: this.i18nService.t("continueToExternalUrlDesc"),
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      this.platformUtilsService.launchUri(url);
    }
  }

  async launchBitwardenUrl(url: string) {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: this.i18nService.t("twoStepContinueToBitwardenUrlTitle"),
      content: this.i18nService.t("twoStepContinueToBitwardenUrlDesc"),
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      this.platformUtilsService.launchUri(url);
    }
  }
}
