import { GeneratorNavigation } from "../navigation/generator-navigation";
import { PassphraseGenerationOptions } from "../passphrase/passphrase-generation-options";

import { PasswordGenerationOptions } from "./password-generation-options";

/** Request format for credential generation.
 *  This type includes all properties suitable for reactive data binding.
 */
export type PasswordGeneratorOptions = PasswordGenerationOptions &
  PassphraseGenerationOptions &
  GeneratorNavigation & { policyUpdated?: boolean };
