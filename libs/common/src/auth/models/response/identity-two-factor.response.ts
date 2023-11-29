import { BaseResponse } from "../../../models/response/base.response";
import { TwoFactorProviderType } from "../../enums/two-factor-provider-type";

import { MasterPasswordPolicyResponse } from "./master-password-policy.response";

export class IdentityTwoFactorResponse extends BaseResponse {
  twoFactorProviders: TwoFactorProviderType[];
  twoFactorProviders2 = new Map<TwoFactorProviderType, { [key: string]: string }>();
  captchaToken: string;
  ssoEmail2faSessionToken: string;
  email?: string;
  masterPasswordPolicy?: MasterPasswordPolicyResponse;

  constructor(response: any) {
    super(response);
    this.captchaToken = this.getResponseProperty("CaptchaBypassToken");
    this.twoFactorProviders = this.getResponseProperty("TwoFactorProviders");
    const twoFactorProviders2 = this.getResponseProperty("TwoFactorProviders2");
    if (twoFactorProviders2 != null) {
      for (const prop in twoFactorProviders2) {
        // eslint-disable-next-line
        if (twoFactorProviders2.hasOwnProperty(prop)) {
          this.twoFactorProviders2.set(parseInt(prop, null), twoFactorProviders2[prop]);
        }
      }
    }
    this.masterPasswordPolicy = new MasterPasswordPolicyResponse(
      this.getResponseProperty("MasterPasswordPolicy"),
    );

    this.ssoEmail2faSessionToken = this.getResponseProperty("SsoEmail2faSessionToken");
    this.email = this.getResponseProperty("Email");
  }
}
