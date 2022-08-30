export abstract class VaultTimeoutSettingsService {
  setVaultTimeoutOptions: (vaultTimeout: number, vaultTimeoutAction: string) => Promise<void>;
  getVaultTimeout: (userId?: string) => Promise<number>;
  isPinLockSet: () => Promise<[boolean, boolean]>;
  isBiometricLockSet: () => Promise<boolean>;
  clear: (userId?: string) => Promise<void>;
}
