import { DisabledPassphraseGeneratorPolicy, DisabledPasswordGeneratorPolicy } from "../data";
import {
  passphraseLeastPrivilege,
  passwordLeastPrivilege,
  PassphraseGeneratorOptionsEvaluator,
  PasswordGeneratorOptionsEvaluator,
} from "../policies";
import { PassphraseGeneratorPolicy, PasswordGeneratorPolicy, PolicyConfiguration } from "../types";

const PASSPHRASE = Object.freeze({
  disabledValue: DisabledPassphraseGeneratorPolicy,
  combine: passphraseLeastPrivilege,
  createEvaluator: (policy) => new PassphraseGeneratorOptionsEvaluator(policy),
} as PolicyConfiguration<PassphraseGeneratorPolicy, PassphraseGeneratorOptionsEvaluator>);

const PASSWORD = Object.freeze({
  disabledValue: DisabledPasswordGeneratorPolicy,
  combine: passwordLeastPrivilege,
  createEvaluator: (policy) => new PasswordGeneratorOptionsEvaluator(policy),
} as PolicyConfiguration<PasswordGeneratorPolicy, PasswordGeneratorOptionsEvaluator>);

/** Policy configurations */
export const Policies = Object.freeze({
  /** Passphrase policy configuration */
  Passphrase: PASSPHRASE,

  /** Passphrase policy configuration */
  Password: PASSWORD,
});
