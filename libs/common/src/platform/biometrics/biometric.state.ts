import { EncryptedString } from "../models/domain/enc-string";
import { KeyDefinition, BIOMETRIC_SETTINGS_DISK } from "../state";

/**
 * If the user has elected to require a password on first unlock of an application instance, this key will store the
 * encrypted client key half used to unlock the vault.
 *
 * For operating systems without application-level key storage, this key half is concatenated with a signature
 * provided by the OS and used to encrypt the biometric key prior to storage.
 */
export const ENCRYPTED_CLIENT_KEY_HALF = new KeyDefinition<EncryptedString>(
  BIOMETRIC_SETTINGS_DISK,
  "clientKeyHalf",
  {
    deserializer: (obj) => obj,
  },
);
