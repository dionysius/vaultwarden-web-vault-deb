import { EncryptedString } from "../models/domain/enc-string";
import { KeyDefinition, BIOMETRIC_SETTINGS_DISK } from "../state";

/**
 * Boolean indicating the user has elected to require a password to use their biometric key upon starting the application.
 *
 * A true setting controls whether {@link ENCRYPTED_CLIENT_KEY_HALF} is set.
 */
export const REQUIRE_PASSWORD_ON_START = new KeyDefinition<boolean>(
  BIOMETRIC_SETTINGS_DISK,
  "requirePasswordOnStart",
  {
    deserializer: (value) => value,
  },
);

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
