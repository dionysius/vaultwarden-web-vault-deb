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
  formPromise: Promise<TwoFactorAuthenticatorResponse>;

  override componentName = "app-two-factor-authenticator";
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

  auth(authResponse: AuthResponse<TwoFactorAuthenticatorResponse>) {
    super.auth(authResponse);
    return this.processResponse(authResponse.response);
  }

  submit = async () => {
    if (this.formGroup.invalid && !this.enabled) {
      return;
    }
    if (this.enabled) {
      await this.disableAuthentication(this.formPromise);
      this.onChangeStatus.emit(this.enabled);
      this.close();
    } else {
      await this.enable();
      this.onChangeStatus.emit(this.enabled);
    }
  };

  private async disableAuthentication(promise: Promise<unknown>) {
    return super.disable(promise);
  }

  protected async enable() {
    const request = await this.buildRequestModel(UpdateTwoFactorAuthenticatorRequest);
    request.token = this.formGroup.value.token;
    request.key = this.key;

    return super.enable(async () => {
      this.formPromise = this.apiService.putTwoFactorAuthenticator(request);
      const response = await this.formPromise;
      await this.processResponse(response);
    });
  }

  private async processResponse(response: TwoFactorAuthenticatorResponse) {
    this.formGroup.get("token").setValue(null);
    this.enabled = response.enabled;
    this.key = response.key;
    const email = await firstValueFrom(
      this.accountService.activeAccount$.pipe(map((a) => a?.email)),
    );
    window.setTimeout(() => {
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
    }, 100);
  }

  close = () => {
    this.dialogRef.close(this.enabled);
  };

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
