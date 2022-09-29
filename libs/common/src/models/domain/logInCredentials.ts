import { AuthenticationType } from "../../enums/authenticationType";
import { SymmetricCryptoKey } from "../../models/domain/symmetricCryptoKey";
import { TokenRequestTwoFactor } from "../request/identityToken/tokenRequestTwoFactor";

export class PasswordLogInCredentials {
  readonly type = AuthenticationType.Password;

  constructor(
    public email: string,
    public masterPassword: string,
    public captchaToken?: string,
    public twoFactor?: TokenRequestTwoFactor
  ) {}
}

export class SsoLogInCredentials {
  readonly type = AuthenticationType.Sso;

  constructor(
    public code: string,
    public codeVerifier: string,
    public redirectUrl: string,
    public orgId: string,
    public twoFactor?: TokenRequestTwoFactor
  ) {}
}

export class ApiLogInCredentials {
  readonly type = AuthenticationType.Api;

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
    public twoFactor?: TokenRequestTwoFactor
  ) {}
}
