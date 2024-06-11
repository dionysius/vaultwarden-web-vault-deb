import { PassphraseGeneratorPolicy } from "../types";

/** The default options for password generation policy. */
export const DisabledPassphraseGeneratorPolicy: PassphraseGeneratorPolicy = Object.freeze({
  minNumberWords: 0,
  capitalize: false,
  includeNumber: false,
});
