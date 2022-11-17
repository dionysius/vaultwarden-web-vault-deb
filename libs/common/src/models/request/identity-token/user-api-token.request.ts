import { DeviceRequest } from "../device.request";

import { TokenTwoFactorRequest } from "./token-two-factor.request";
import { TokenRequest } from "./token.request";

export class UserApiTokenRequest extends TokenRequest {
  constructor(
    public clientId: string,
    public clientSecret: string,
    protected twoFactor: TokenTwoFactorRequest,
    device?: DeviceRequest
  ) {
    super(twoFactor, device);
  }

  toIdentityToken() {
    const obj = super.toIdentityToken(this.clientId);

    obj.scope = this.clientId.startsWith("organization") ? "api.organization" : "api";
    obj.grant_type = "client_credentials";
    obj.client_secret = this.clientSecret;

    return obj;
  }
}
