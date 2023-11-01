export enum BiometricAction {
  EnabledForUser = "enabled",
  OsSupported = "osSupported",
  Authenticate = "authenticate",
}

export type BiometricMessage = {
  action: BiometricAction;
  keySuffix?: string;
  key?: string;
  userId?: string;
};
