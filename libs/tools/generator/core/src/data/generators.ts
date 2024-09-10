import { Randomizer } from "../abstractions";
import { PasswordRandomizer } from "../engine";
import { PASSPHRASE_SETTINGS, PASSWORD_SETTINGS } from "../strategies/storage";
import {
  CredentialGenerator,
  PassphraseGenerationOptions,
  PassphraseGeneratorPolicy,
  PasswordGenerationOptions,
  PasswordGeneratorPolicy,
} from "../types";
import { CredentialGeneratorConfiguration } from "../types/credential-generator-configuration";

import { DefaultPassphraseBoundaries } from "./default-passphrase-boundaries";
import { DefaultPassphraseGenerationOptions } from "./default-passphrase-generation-options";
import { DefaultPasswordBoundaries } from "./default-password-boundaries";
import { DefaultPasswordGenerationOptions } from "./default-password-generation-options";
import { Policies } from "./policies";

const PASSPHRASE = Object.freeze({
  category: "passphrase",
  engine: {
    create(randomizer: Randomizer): CredentialGenerator<PassphraseGenerationOptions> {
      return new PasswordRandomizer(randomizer);
    },
  },
  settings: {
    initial: DefaultPassphraseGenerationOptions,
    constraints: {
      numWords: {
        min: DefaultPassphraseBoundaries.numWords.min,
        max: DefaultPassphraseBoundaries.numWords.max,
      },
      wordSeparator: { maxLength: 1 },
    },
    account: PASSPHRASE_SETTINGS,
  },
  policy: Policies.Passphrase,
} satisfies CredentialGeneratorConfiguration<
  PassphraseGenerationOptions,
  PassphraseGeneratorPolicy
>);

const PASSWORD = Object.freeze({
  category: "password",
  engine: {
    create(randomizer: Randomizer): CredentialGenerator<PasswordGenerationOptions> {
      return new PasswordRandomizer(randomizer);
    },
  },
  settings: {
    initial: DefaultPasswordGenerationOptions,
    constraints: {
      length: {
        min: DefaultPasswordBoundaries.length.min,
        max: DefaultPasswordBoundaries.length.max,
      },
      minNumber: {
        min: DefaultPasswordBoundaries.minDigits.min,
        max: DefaultPasswordBoundaries.minDigits.max,
      },
      minSpecial: {
        min: DefaultPasswordBoundaries.minSpecialCharacters.min,
        max: DefaultPasswordBoundaries.minSpecialCharacters.max,
      },
    },
    account: PASSWORD_SETTINGS,
  },
  policy: Policies.Password,
} satisfies CredentialGeneratorConfiguration<PasswordGenerationOptions, PasswordGeneratorPolicy>);

/** Generator configurations */
export const Generators = Object.freeze({
  /** Passphrase generator configuration */
  Passphrase: PASSPHRASE,

  /** Password generator configuration */
  Password: PASSWORD,
});
