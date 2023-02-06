import { Utils } from "../../../misc/utils";
import { TwoFactorProviderType } from "../../enums/two-factor-provider-type";

export class AuthResult {
  captchaSiteKey = "";
  resetMasterPassword = false;
  forcePasswordReset = false;
  twoFactorProviders: Map<TwoFactorProviderType, { [key: string]: string }> = null;

  get requiresCaptcha() {
    return !Utils.isNullOrWhitespace(this.captchaSiteKey);
  }

  get requiresTwoFactor() {
    return this.twoFactorProviders != null;
  }
}
