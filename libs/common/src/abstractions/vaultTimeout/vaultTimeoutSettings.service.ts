import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";

export abstract class VaultTimeoutSettingsService {
  setVaultTimeoutOptions: (
    vaultTimeout: number,
    vaultTimeoutAction: VaultTimeoutAction
  ) => Promise<void>;
  getVaultTimeout: (userId?: string) => Promise<number>;
  getVaultTimeoutAction: (userId?: string) => Promise<VaultTimeoutAction>;
  isPinLockSet: () => Promise<[boolean, boolean]>;
  isBiometricLockSet: () => Promise<boolean>;
  clear: (userId?: string) => Promise<void>;
}
