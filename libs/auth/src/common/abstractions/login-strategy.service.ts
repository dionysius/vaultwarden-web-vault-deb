import { Observable } from "rxjs";

import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { AuthRequestPushNotification } from "@bitwarden/common/models/response/notification.response";
import { MasterKey } from "@bitwarden/common/types/key";

import {
  UserApiLoginCredentials,
  PasswordLoginCredentials,
  SsoLoginCredentials,
  AuthRequestLoginCredentials,
  WebAuthnLoginCredentials,
} from "../models/domain/login-credentials";

export abstract class LoginStrategyServiceAbstraction {
  masterPasswordHash: string;
  email: string;
  accessCode: string;
  authRequestId: string;
  ssoEmail2FaSessionToken: string;

  logIn: (
    credentials:
      | UserApiLoginCredentials
      | PasswordLoginCredentials
      | SsoLoginCredentials
      | AuthRequestLoginCredentials
      | WebAuthnLoginCredentials,
  ) => Promise<AuthResult>;
  logInTwoFactor: (
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string,
  ) => Promise<AuthResult>;
  makePreloginKey: (masterPassword: string, email: string) => Promise<MasterKey>;
  authingWithUserApiKey: () => boolean;
  authingWithSso: () => boolean;
  authingWithPassword: () => boolean;
  authingWithPasswordless: () => boolean;
  authResponsePushNotification: (notification: AuthRequestPushNotification) => Promise<any>;
  passwordlessLogin: (
    id: string,
    key: string,
    requestApproved: boolean,
  ) => Promise<AuthRequestResponse>;
  getPushNotificationObs$: () => Observable<any>;
}
