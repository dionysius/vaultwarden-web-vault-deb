import { Utils } from "../../../platform/misc/utils";
import { TwoFactorProviderType } from "../../enums/two-factor-provider-type";

import { ForceResetPasswordReason } from "./force-reset-password-reason";

export class AuthResult {
  captchaSiteKey = "";
  resetMasterPassword = false;
  forcePasswordReset: ForceResetPasswordReason = ForceResetPasswordReason.None;
  twoFactorProviders: Map<TwoFactorProviderType, { [key: string]: string }> = null;
  ssoEmail2FaSessionToken?: string;
  email: string;

  get requiresCaptcha() {
    return !Utils.isNullOrWhitespace(this.captchaSiteKey);
  }

  get requiresTwoFactor() {
    return this.twoFactorProviders != null;
  }
}
