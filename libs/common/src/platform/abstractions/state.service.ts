import { BiometricKey } from "../../auth/types/biometric-key";
import { GeneratorOptions } from "../../tools/generator/generator-options";
import { GeneratedPasswordHistory, PasswordGeneratorOptions } from "../../tools/generator/password";
import { UsernameGeneratorOptions } from "../../tools/generator/username";
import { UserId } from "../../types/guid";
import { Account } from "../models/domain/account";
import { StorageOptions } from "../models/domain/storage-options";

/**
 * Options for customizing the initiation behavior.
 */
export type InitOptions = {
  /**
   * Whether or not to run state migrations as part of the init process. Defaults to true.
   *
   * If false, the init method will instead wait for migrations to complete before doing its
   * other init operations. Make sure migrations have either already completed, or will complete
   * before calling {@link StateService.init} with `runMigrations: false`.
   */
  runMigrations?: boolean;
};

export abstract class StateService<T extends Account = Account> {
  addAccount: (account: T) => Promise<void>;
  clearDecryptedData: (userId: UserId) => Promise<void>;
  clean: (options?: StorageOptions) => Promise<void>;
  init: (initOptions?: InitOptions) => Promise<void>;

  /**
   * Gets the user's auto key
   */
  getUserKeyAutoUnlock: (options?: StorageOptions) => Promise<string>;
  /**
   * Sets the user's auto key
   */
  setUserKeyAutoUnlock: (value: string, options?: StorageOptions) => Promise<void>;
  /**
   * Gets the user's biometric key
   */
  getUserKeyBiometric: (options?: StorageOptions) => Promise<string>;
  /**
   * Checks if the user has a biometric key available
   */
  hasUserKeyBiometric: (options?: StorageOptions) => Promise<boolean>;
  /**
   * Sets the user's biometric key
   */
  setUserKeyBiometric: (value: BiometricKey, options?: StorageOptions) => Promise<void>;
  /**
   * @deprecated For backwards compatible purposes only, use DesktopAutofillSettingsService
   */
  setEnableDuckDuckGoBrowserIntegration: (
    value: boolean,
    options?: StorageOptions,
  ) => Promise<void>;
  /**
   * @deprecated For migration purposes only, use getUserKeyMasterKey instead
   */
  getEncryptedCryptoSymmetricKey: (options?: StorageOptions) => Promise<string>;
  /**
   * @deprecated For migration purposes only, use setUserKeyAuto instead
   */
  setCryptoMasterKeyAuto: (value: string, options?: StorageOptions) => Promise<void>;
  /**
   * @deprecated For migration purposes only, use getUserKeyBiometric instead
   */
  getCryptoMasterKeyBiometric: (options?: StorageOptions) => Promise<string>;
  /**
   * @deprecated For migration purposes only, use hasUserKeyBiometric instead
   */
  hasCryptoMasterKeyBiometric: (options?: StorageOptions) => Promise<boolean>;
  /**
   * @deprecated For migration purposes only, use setUserKeyBiometric instead
   */
  setCryptoMasterKeyBiometric: (value: BiometricKey, options?: StorageOptions) => Promise<void>;
  getDecryptedPasswordGenerationHistory: (
    options?: StorageOptions,
  ) => Promise<GeneratedPasswordHistory[]>;
  setDecryptedPasswordGenerationHistory: (
    value: GeneratedPasswordHistory[],
    options?: StorageOptions,
  ) => Promise<void>;
  getDuckDuckGoSharedKey: (options?: StorageOptions) => Promise<string>;
  setDuckDuckGoSharedKey: (value: string, options?: StorageOptions) => Promise<void>;
  getEmail: (options?: StorageOptions) => Promise<string>;
  setEmail: (value: string, options?: StorageOptions) => Promise<void>;
  getEnableBrowserIntegration: (options?: StorageOptions) => Promise<boolean>;
  setEnableBrowserIntegration: (value: boolean, options?: StorageOptions) => Promise<void>;
  getEnableBrowserIntegrationFingerprint: (options?: StorageOptions) => Promise<boolean>;
  setEnableBrowserIntegrationFingerprint: (
    value: boolean,
    options?: StorageOptions,
  ) => Promise<void>;
  getEncryptedPasswordGenerationHistory: (
    options?: StorageOptions,
  ) => Promise<GeneratedPasswordHistory[]>;
  setEncryptedPasswordGenerationHistory: (
    value: GeneratedPasswordHistory[],
    options?: StorageOptions,
  ) => Promise<void>;
  getIsAuthenticated: (options?: StorageOptions) => Promise<boolean>;
  getLastSync: (options?: StorageOptions) => Promise<string>;
  setLastSync: (value: string, options?: StorageOptions) => Promise<void>;
  getMinimizeOnCopyToClipboard: (options?: StorageOptions) => Promise<boolean>;
  setMinimizeOnCopyToClipboard: (value: boolean, options?: StorageOptions) => Promise<void>;
  getOrganizationInvitation: (options?: StorageOptions) => Promise<any>;
  setOrganizationInvitation: (value: any, options?: StorageOptions) => Promise<void>;
  getPasswordGenerationOptions: (options?: StorageOptions) => Promise<PasswordGeneratorOptions>;
  setPasswordGenerationOptions: (
    value: PasswordGeneratorOptions,
    options?: StorageOptions,
  ) => Promise<void>;
  getUsernameGenerationOptions: (options?: StorageOptions) => Promise<UsernameGeneratorOptions>;
  setUsernameGenerationOptions: (
    value: UsernameGeneratorOptions,
    options?: StorageOptions,
  ) => Promise<void>;
  getGeneratorOptions: (options?: StorageOptions) => Promise<GeneratorOptions>;
  setGeneratorOptions: (value: GeneratorOptions, options?: StorageOptions) => Promise<void>;
  getUserId: (options?: StorageOptions) => Promise<string>;
  getVaultTimeout: (options?: StorageOptions) => Promise<number>;
  setVaultTimeout: (value: number, options?: StorageOptions) => Promise<void>;
  getVaultTimeoutAction: (options?: StorageOptions) => Promise<string>;
  setVaultTimeoutAction: (value: string, options?: StorageOptions) => Promise<void>;
}
