import { DeviceRequest } from "../device.request";

import { TokenTwoFactorRequest } from "./token-two-factor.request";

export abstract class TokenRequest {
  protected device?: DeviceRequest;
  protected passwordlessAuthRequest: string;

  constructor(protected twoFactor: TokenTwoFactorRequest, device?: DeviceRequest) {
    this.device = device != null ? device : null;
  }

  // eslint-disable-next-line
  alterIdentityTokenHeaders(headers: Headers) {
    // Implemented in subclass if required
  }

  setTwoFactor(twoFactor: TokenTwoFactorRequest) {
    this.twoFactor = twoFactor;
  }

  setPasswordlessAccessCode(accessCode: string) {
    this.passwordlessAuthRequest = accessCode;
  }

  protected toIdentityToken(clientId: string) {
    const obj: any = {
      scope: "api offline_access",
      client_id: clientId,
    };

    if (this.device) {
      obj.deviceType = this.device.type;
      obj.deviceIdentifier = this.device.identifier;
      obj.deviceName = this.device.name;
      // no push tokens for browser apps yet
      // obj.devicePushToken = this.device.pushToken;
    }

    //passswordless login
    if (this.passwordlessAuthRequest) {
      obj.authRequest = this.passwordlessAuthRequest;
    }

    if (this.twoFactor) {
      if (this.twoFactor.token && this.twoFactor.provider != null) {
        obj.twoFactorToken = this.twoFactor.token;
        obj.twoFactorProvider = this.twoFactor.provider;
        obj.twoFactorRemember = this.twoFactor.remember ? "1" : "0";
      }
    }

    return obj;
  }
}
