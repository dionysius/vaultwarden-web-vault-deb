import { Observable } from "rxjs";

import { KdfConfig } from "../../auth/models/domain/kdf-config";
import { BiometricKey } from "../../auth/types/biometric-key";
import { GeneratorOptions } from "../../tools/generator/generator-options";
import { GeneratedPasswordHistory, PasswordGeneratorOptions } from "../../tools/generator/password";
import { UsernameGeneratorOptions } from "../../tools/generator/username";
import { UserId } from "../../types/guid";
import { KdfType } from "../enums";
import { Account } from "../models/domain/account";
import { EncString } from "../models/domain/enc-string";
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
  accounts$: Observable<{ [userId: string]: T }>;
  activeAccount$: Observable<string>;

  addAccount: (account: T) => Promise<void>;
  setActiveUser: (userId: string) => Promise<void>;
  clean: (options?: StorageOptions) => Promise<UserId>;
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
   * Gets the user key encrypted by the Pin key.
   * Used when Lock with MP on Restart is disabled
   */
  getPinKeyEncryptedUserKey: (options?: StorageOptions) => Promise<EncString>;
  /**
   * Sets the user key encrypted by the Pin key.
   * Used when Lock with MP on Restart is disabled
   */
  setPinKeyEncryptedUserKey: (value: EncString, options?: StorageOptions) => Promise<void>;
  /**
   * Gets the ephemeral version of the user key encrypted by the Pin key.
   * Used when Lock with MP on Restart is enabled
   */
  getPinKeyEncryptedUserKeyEphemeral: (options?: StorageOptions) => Promise<EncString>;
  /**
   * Sets the ephemeral version of the user key encrypted by the Pin key.
   * Used when Lock with MP on Restart is enabled
   */
  setPinKeyEncryptedUserKeyEphemeral: (value: EncString, options?: StorageOptions) => Promise<void>;
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
   * @deprecated For migration purposes only, use getUserKeyAuto instead
   */
  getCryptoMasterKeyAuto: (options?: StorageOptions) => Promise<string>;
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
  /**
   * @deprecated For migration purposes only, use getDecryptedUserKeyPin instead
   */
  getDecryptedPinProtected: (options?: StorageOptions) => Promise<EncString>;
  /**
   * @deprecated For migration purposes only, use setDecryptedUserKeyPin instead
   */
  setDecryptedPinProtected: (value: EncString, options?: StorageOptions) => Promise<void>;
  getDuckDuckGoSharedKey: (options?: StorageOptions) => Promise<string>;
  setDuckDuckGoSharedKey: (value: string, options?: StorageOptions) => Promise<void>;
  getEmail: (options?: StorageOptions) => Promise<string>;
  setEmail: (value: string, options?: StorageOptions) => Promise<void>;
  getEmailVerified: (options?: StorageOptions) => Promise<boolean>;
  setEmailVerified: (value: boolean, options?: StorageOptions) => Promise<void>;
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
  /**
   * @deprecated For migration purposes only, use getEncryptedUserKeyPin instead
   */
  getEncryptedPinProtected: (options?: StorageOptions) => Promise<string>;
  /**
   * @deprecated For migration purposes only, use setEncryptedUserKeyPin instead
   */
  setEncryptedPinProtected: (value: string, options?: StorageOptions) => Promise<void>;
  getIsAuthenticated: (options?: StorageOptions) => Promise<boolean>;
  getKdfConfig: (options?: StorageOptions) => Promise<KdfConfig>;
  setKdfConfig: (kdfConfig: KdfConfig, options?: StorageOptions) => Promise<void>;
  getKdfType: (options?: StorageOptions) => Promise<KdfType>;
  setKdfType: (value: KdfType, options?: StorageOptions) => Promise<void>;
  getLastActive: (options?: StorageOptions) => Promise<number>;
  setLastActive: (value: number, options?: StorageOptions) => Promise<void>;
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
  /**
   * Gets the user's Pin, encrypted by the user key
   */
  getProtectedPin: (options?: StorageOptions) => Promise<string>;
  /**
   * Sets the user's Pin, encrypted by the user key
   */
  setProtectedPin: (value: string, options?: StorageOptions) => Promise<void>;
  getSecurityStamp: (options?: StorageOptions) => Promise<string>;
  setSecurityStamp: (value: string, options?: StorageOptions) => Promise<void>;
  getUserId: (options?: StorageOptions) => Promise<string>;
  getVaultTimeout: (options?: StorageOptions) => Promise<number>;
  setVaultTimeout: (value: number, options?: StorageOptions) => Promise<void>;
  getVaultTimeoutAction: (options?: StorageOptions) => Promise<string>;
  setVaultTimeoutAction: (value: string, options?: StorageOptions) => Promise<void>;
  nextUpActiveUser: () => Promise<UserId>;
}
