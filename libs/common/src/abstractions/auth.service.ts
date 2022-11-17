import { Observable } from "rxjs";

import { AuthenticationStatus } from "../enums/authenticationStatus";
import { AuthResult } from "../models/domain/auth-result";
import {
  UserApiLogInCredentials,
  PasswordLogInCredentials,
  SsoLogInCredentials,
  PasswordlessLogInCredentials,
} from "../models/domain/log-in-credentials";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";
import { AuthRequestPushNotification } from "../models/response/notification.response";

export abstract class AuthService {
  masterPasswordHash: string;
  email: string;
  accessCode: string;
  authRequestId: string;

  logIn: (
    credentials:
      | UserApiLogInCredentials
      | PasswordLogInCredentials
      | SsoLogInCredentials
      | PasswordlessLogInCredentials
  ) => Promise<AuthResult>;
  logInTwoFactor: (
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string
  ) => Promise<AuthResult>;
  logOut: (callback: () => void) => void;
  makePreloginKey: (masterPassword: string, email: string) => Promise<SymmetricCryptoKey>;
  authingWithUserApiKey: () => boolean;
  authingWithSso: () => boolean;
  authingWithPassword: () => boolean;
  authingWithPasswordless: () => boolean;
  getAuthStatus: (userId?: string) => Promise<AuthenticationStatus>;
  authResponsePushNotifiction: (notification: AuthRequestPushNotification) => Promise<any>;

  getPushNotifcationObs$: () => Observable<any>;
}
