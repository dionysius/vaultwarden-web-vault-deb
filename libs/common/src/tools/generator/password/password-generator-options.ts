import { PassphraseGenerationOptions } from "../passphrase/passphrase-generation-options";

import { PasswordGenerationOptions } from "./password-generation-options";

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
