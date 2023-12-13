/** Request format for credential generation.
 *  This type includes all properties suitable for reactive data binding.
 */
export type PasswordGeneratorOptions = PasswordGenerationOptions &
  PassphraseGenerationOptions & {
    /** The algorithm to use for credential generation.
     * Properties on @see PasswordGenerationOptions should be processed
     * only when `type === "password"`.
     * Properties on @see PassphraseGenerationOptions should be processed
     * only when `type === "passphrase"`.
     */
    type?: "password" | "passphrase";
  };

/** Request format for password credential generation.
 *  All members of this type may be `undefined` when the user is
 *  generating a passphrase.
 */
export type PasswordGenerationOptions = {
  /** The length of the password selected by the user */
  length?: number;

  /** The minimum length of the password. This defaults to 5, and increases
   * to ensure `minLength` is at least as large as the sum of the other minimums.
   */
  minLength?: number;

  /** `true` when ambiguous characters may be included in the output.
   *  `false` when ambiguous characters should not be included in the output.
   */
  ambiguous?: boolean;

  /** `true` when uppercase ASCII characters should be included in the output
   * This value defaults to `false.
   */
  uppercase?: boolean;

  /** The minimum number of uppercase characters to include in the output.
   *  The value is ignored when `uppercase` is `false`.
   *  The value defaults to 1 when `uppercase` is `true`.
   */
  minUppercase?: number;

  /** `true` when lowercase ASCII characters should be included in the output.
   * This value defaults to `false`.
   */
  lowercase?: boolean;

  /** The minimum number of lowercase characters to include in the output.
   * The value defaults to 1 when `lowercase` is `true`.
   * The value defaults to 0 when `lowercase` is `false`.
   */
  minLowercase?: number;

  /** Whether or not to include ASCII digits in the output
   * This value defaults to `true` when `minNumber` is at least 1.
   * This value defaults to `false` when `minNumber` is less than 1.
   */
  number?: boolean;

  /** The minimum number of digits to include in the output.
   * The value defaults to 1 when `number` is `true`.
   * The value defaults to 0 when `number` is `false`.
   */
  minNumber?: number;

  /** Whether or not to include special characters in the output.
   * This value defaults to `true` when `minSpecial` is at least 1.
   * This value defaults to `false` when `minSpecial` is less than 1.
   */
  special?: boolean;

  /** The minimum number of special characters to include in the output.
   * This value defaults to 1 when `special` is `true`.
   * This value defaults to 0 when `special` is `false`.
   */
  minSpecial?: number;
};

/** Request format for passphrase credential generation.
 *  The members of this type may be `undefined` when the user is
 *  generating a password.
 */
export type PassphraseGenerationOptions = {
  /** The number of words to include in the passphrase.
   * This value defaults to 4.
   */
  numWords?: number;

  /** The ASCII separator character to use between words in the passphrase.
   * This value defaults to a dash.
   * If multiple characters appear in the string, only the first character is used.
   */
  wordSeparator?: string;

  /** `true` when the first character of every word should be capitalized.
   * This value defaults to `false`.
   */
  capitalize?: boolean;

  /** `true` when a number should be included in the passphrase.
   * This value defaults to `false`.
   */
  includeNumber?: boolean;
};
