import { Observable } from "rxjs";

import { AuthenticationStatus } from "../enums/authenticationStatus";
import { AuthResult } from "../models/domain/auth-result";
import {
  ApiLogInCredentials,
  PasswordLogInCredentials,
  SsoLogInCredentials,
  PasswordlessLogInCredentials,
} from "../models/domain/log-in-credentials";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";
import { TokenRequestTwoFactor } from "../models/request/identityToken/tokenRequestTwoFactor";
import { AuthRequestPushNotification } from "../models/response/notificationResponse";

export abstract class AuthService {
  masterPasswordHash: string;
  email: string;
  logIn: (
    credentials:
      | ApiLogInCredentials
      | PasswordLogInCredentials
      | SsoLogInCredentials
      | PasswordlessLogInCredentials
  ) => Promise<AuthResult>;
  logInTwoFactor: (
    twoFactor: TokenRequestTwoFactor,
    captchaResponse: string
  ) => Promise<AuthResult>;
  logOut: (callback: () => void) => void;
  makePreloginKey: (masterPassword: string, email: string) => Promise<SymmetricCryptoKey>;
  authingWithApiKey: () => boolean;
  authingWithSso: () => boolean;
  authingWithPassword: () => boolean;
  getAuthStatus: (userId?: string) => Promise<AuthenticationStatus>;
  authResponsePushNotifiction: (notification: AuthRequestPushNotification) => Promise<any>;

  getPushNotifcationObs$: () => Observable<any>;
}
