import { PASSPHRASE_SETTINGS } from "../strategies/storage";
import { PassphraseGenerationOptions, PassphraseGeneratorPolicy } from "../types";
import { CredentialGeneratorConfiguration } from "../types/credential-generator-configuration";

import { DefaultPassphraseBoundaries } from "./default-passphrase-boundaries";
import { DefaultPassphraseGenerationOptions } from "./default-passphrase-generation-options";
import { Policies } from "./policies";

const PASSPHRASE = Object.freeze({
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

/** Generator configurations */
export const Generators = Object.freeze({
  /** Passphrase generator configuration */
  Passphrase: PASSPHRASE,
});
