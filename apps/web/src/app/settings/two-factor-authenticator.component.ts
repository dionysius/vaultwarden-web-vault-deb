import { Component, OnDestroy, OnInit } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { TwoFactorProviderType } from "@bitwarden/common/enums/twoFactorProviderType";
import { Utils } from "@bitwarden/common/misc/utils";
import { UpdateTwoFactorAuthenticatorRequest } from "@bitwarden/common/models/request/update-two-factor-authenticator.request";
import { TwoFactorAuthenticatorResponse } from "@bitwarden/common/models/response/two-factor-authenticator.response";
import { AuthResponse } from "@bitwarden/common/types/authResponse";

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
  type = TwoFactorProviderType.Authenticator;
  key: string;
  token: string;
  formPromise: Promise<TwoFactorAuthenticatorResponse>;

  private qrScript: HTMLScriptElement;

  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    userVerificationService: UserVerificationService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    private stateService: StateService
  ) {
    super(apiService, i18nService, platformUtilsService, logService, userVerificationService);
    this.qrScript = window.document.createElement("script");
    this.qrScript.src = "scripts/qrious.min.js";
    this.qrScript.async = true;
  }

  ngOnInit() {
    window.document.body.appendChild(this.qrScript);
  }

  ngOnDestroy() {
    window.document.body.removeChild(this.qrScript);
  }

  auth(authResponse: AuthResponse<TwoFactorAuthenticatorResponse>) {
    super.auth(authResponse);
    return this.processResponse(authResponse.response);
  }

  submit() {
    if (this.enabled) {
      return super.disable(this.formPromise);
    } else {
      return this.enable();
    }
  }

  protected async enable() {
    const request = await this.buildRequestModel(UpdateTwoFactorAuthenticatorRequest);
    request.token = this.token;
    request.key = this.key;

    return super.enable(async () => {
      this.formPromise = this.apiService.putTwoFactorAuthenticator(request);
      const response = await this.formPromise;
      await this.processResponse(response);
    });
  }

  private async processResponse(response: TwoFactorAuthenticatorResponse) {
    this.token = null;
    this.enabled = response.enabled;
    this.key = response.key;
    const email = await this.stateService.getEmail();
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
}
