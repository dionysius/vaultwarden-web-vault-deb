import { AuthenticationType } from "../../enums/authenticationType";
import { TokenTwoFactorRequest } from "../request/identity-token/token-two-factor.request";

import { SymmetricCryptoKey } from "./symmetric-crypto-key";

export class PasswordLogInCredentials {
  readonly type = AuthenticationType.Password;

  constructor(
    public email: string,
    public masterPassword: string,
    public captchaToken?: string,
    public twoFactor?: TokenTwoFactorRequest
  ) {}
}

export class SsoLogInCredentials {
  readonly type = AuthenticationType.Sso;

  constructor(
    public code: string,
    public codeVerifier: string,
    public redirectUrl: string,
    public orgId: string,
    public twoFactor?: TokenTwoFactorRequest
  ) {}
}

export class UserApiLogInCredentials {
  readonly type = AuthenticationType.UserApi;

  constructor(public clientId: string, public clientSecret: string) {}
}

export class PasswordlessLogInCredentials {
  readonly type = AuthenticationType.Passwordless;

  constructor(
    public email: string,
    public accessCode: string,
    public authRequestId: string,
    public decKey: SymmetricCryptoKey,
    public localPasswordHash: string,
    public twoFactor?: TokenTwoFactorRequest
  ) {}
}
