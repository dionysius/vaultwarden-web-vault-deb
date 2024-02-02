/** Policy options enforced during passphrase generation. */
export type PassphraseGeneratorPolicy = {
  minNumberWords: number;
  capitalize: boolean;
  includeNumber: boolean;
};

/** The default options for password generation policy. */
export const DisabledPassphraseGeneratorPolicy: PassphraseGeneratorPolicy = Object.freeze({
  minNumberWords: 0,
  capitalize: false,
  includeNumber: false,
});
