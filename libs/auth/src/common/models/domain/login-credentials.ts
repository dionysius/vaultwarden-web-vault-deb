import { AuthenticationType } from "@bitwarden/common/auth/enums/authentication-type";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { WebAuthnLoginAssertionResponseRequest } from "@bitwarden/common/auth/services/webauthn-login/request/webauthn-login-assertion-response.request";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { UserKey, MasterKey } from "@bitwarden/common/types/key";

export class PasswordLoginCredentials {
  readonly type = AuthenticationType.Password;

  constructor(
    public email: string,
    public masterPassword: string,
    public captchaToken?: string,
    public twoFactor?: TokenTwoFactorRequest,
  ) {}
}

export class SsoLoginCredentials {
  readonly type = AuthenticationType.Sso;

  constructor(
    public code: string,
    public codeVerifier: string,
    public redirectUrl: string,
    public orgId: string,
    public twoFactor?: TokenTwoFactorRequest,
  ) {}
}

export class UserApiLoginCredentials {
  readonly type = AuthenticationType.UserApi;

  constructor(
    public clientId: string,
    public clientSecret: string,
  ) {}
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
    public twoFactor?: TokenTwoFactorRequest,
  ) {}
}

export class WebAuthnLoginCredentials {
  readonly type = AuthenticationType.WebAuthn;

  constructor(
    public token: string,
    public deviceResponse: WebAuthnLoginAssertionResponseRequest,
    public prfKey?: SymmetricCryptoKey,
  ) {}
}
