import { PasswordGenerationOptions } from "../types";

import { DefaultPasswordBoundaries } from "./default-password-boundaries";

/** The default options for password generation. */
export const DefaultPasswordGenerationOptions: Partial<PasswordGenerationOptions> = Object.freeze({
  length: 14,
  minLength: DefaultPasswordBoundaries.length.min,
  ambiguous: true,
  uppercase: true,
  lowercase: true,
  number: true,
  minNumber: 1,
  special: false,
  minSpecial: 0,
});
