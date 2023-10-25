import { MasterKey, UserKey } from "../../../platform/models/domain/symmetric-crypto-key";
import { AuthenticationType } from "../../enums/authentication-type";
import { TokenTwoFactorRequest } from "../request/identity-token/token-two-factor.request";

export class PasswordLoginCredentials {
  readonly type = AuthenticationType.Password;

  constructor(
    public email: string,
    public masterPassword: string,
    public captchaToken?: string,
    public twoFactor?: TokenTwoFactorRequest
  ) {}
}

export class SsoLoginCredentials {
  readonly type = AuthenticationType.Sso;

  constructor(
    public code: string,
    public codeVerifier: string,
    public redirectUrl: string,
    public orgId: string,
    public twoFactor?: TokenTwoFactorRequest
  ) {}
}

export class UserApiLoginCredentials {
  readonly type = AuthenticationType.UserApi;

  constructor(public clientId: string, public clientSecret: string) {}
}

export class AuthRequestLoginCredentials {
  readonly type = AuthenticationType.AuthRequest;

  constructor(
    public email: string,
    public accessCode: string,
    public authRequestId: string,
    public decryptedUserKey: UserKey,
    public decryptedMasterKey: MasterKey,
    public decryptedMasterKeyHash: string,
    public twoFactor?: TokenTwoFactorRequest
  ) {}
}
