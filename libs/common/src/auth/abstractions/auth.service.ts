import { AuthenticationStatus } from "../enums/authentication-status";

export abstract class AuthService {
  getAuthStatus: (userId?: string) => Promise<AuthenticationStatus>;
  logOut: (callback: () => void) => void;
}
