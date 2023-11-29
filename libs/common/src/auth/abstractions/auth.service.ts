import { Observable } from "rxjs";

import { AuthRequestPushNotification } from "../../models/response/notification.response";
import { MasterKey } from "../../platform/models/domain/symmetric-crypto-key";
import { AuthenticationStatus } from "../enums/authentication-status";
import { AuthResult } from "../models/domain/auth-result";
import {
  UserApiLoginCredentials,
  PasswordLoginCredentials,
  SsoLoginCredentials,
  AuthRequestLoginCredentials,
  WebAuthnLoginCredentials,
} from "../models/domain/login-credentials";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";
import { AuthRequestResponse } from "../models/response/auth-request.response";

export abstract class AuthService {
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
  logOut: (callback: () => void) => void;
  makePreloginKey: (masterPassword: string, email: string) => Promise<MasterKey>;
  authingWithUserApiKey: () => boolean;
  authingWithSso: () => boolean;
  authingWithPassword: () => boolean;
  authingWithPasswordless: () => boolean;
  getAuthStatus: (userId?: string) => Promise<AuthenticationStatus>;
  authResponsePushNotification: (notification: AuthRequestPushNotification) => Promise<any>;
  passwordlessLogin: (
    id: string,
    key: string,
    requestApproved: boolean,
  ) => Promise<AuthRequestResponse>;
  getPushNotificationObs$: () => Observable<any>;
}
