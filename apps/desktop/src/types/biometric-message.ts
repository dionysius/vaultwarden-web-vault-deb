export enum BiometricStorageAction {
  EnabledForUser = "enabled",
  OsSupported = "osSupported",
}

export type BiometricMessage = {
  action: BiometricStorageAction;
  keySuffix?: string;
  key?: string;
  userId?: string;
};
