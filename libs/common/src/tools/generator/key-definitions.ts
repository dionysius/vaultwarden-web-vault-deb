import { GENERATOR_DISK, GENERATOR_MEMORY, KeyDefinition } from "../../platform/state";

import { PassphraseGenerationOptions } from "./passphrase/passphrase-generation-options";
import { GeneratedPasswordHistory } from "./password/generated-password-history";
import { PasswordGenerationOptions } from "./password/password-generation-options";

/** plaintext password generation options */
export const PASSWORD_SETTINGS = new KeyDefinition<PasswordGenerationOptions>(
  GENERATOR_DISK,
  "passwordGeneratorSettings",
  {
    deserializer: (value) => value,
  },
);

/** plaintext passphrase generation options */
export const PASSPHRASE_SETTINGS = new KeyDefinition<PassphraseGenerationOptions>(
  GENERATOR_DISK,
  "passphraseGeneratorSettings",
  {
    deserializer: (value) => value,
  },
);

/** plaintext username generation options */
export const ENCRYPTED_USERNAME_SETTINGS = new KeyDefinition<PasswordGenerationOptions>(
  GENERATOR_DISK,
  "usernameGeneratorSettings",
  {
    deserializer: (value) => value,
  },
);

/** plaintext username generation options */
export const PLAINTEXT_USERNAME_SETTINGS = new KeyDefinition<PasswordGenerationOptions>(
  GENERATOR_MEMORY,
  "usernameGeneratorSettings",
  {
    deserializer: (value) => value,
  },
);

/** encrypted password generation history */
export const ENCRYPTED_HISTORY = new KeyDefinition<GeneratedPasswordHistory>(
  GENERATOR_DISK,
  "passwordGeneratorHistory",
  {
    deserializer: (value) => value,
  },
);
