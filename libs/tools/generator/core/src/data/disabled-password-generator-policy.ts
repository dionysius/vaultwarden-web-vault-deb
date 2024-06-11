import { PasswordGeneratorPolicy } from "../types";

/** The default options for password generation policy. */
export const DisabledPasswordGeneratorPolicy: PasswordGeneratorPolicy = Object.freeze({
  minLength: 0,
  useUppercase: false,
  useLowercase: false,
  useNumbers: false,
  numberCount: 0,
  useSpecial: false,
  specialCount: 0,
});
