import { GENERATOR_DISK, KeyDefinition } from "../../platform/state";

import { PassphraseGenerationOptions } from "./passphrase/passphrase-generation-options";
import { GeneratedPasswordHistory } from "./password/generated-password-history";
import { PasswordGenerationOptions } from "./password/password-generation-options";
import { EffUsernameGenerationOptions } from "./username/eff-username-generator-options";

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
export const EFF_USERNAME_SETTINGS = new KeyDefinition<EffUsernameGenerationOptions>(
  GENERATOR_DISK,
  "effUsernameGeneratorSettings",
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
