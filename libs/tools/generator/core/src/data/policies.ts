import { PolicyType } from "@bitwarden/common/admin-console/enums";

import {
  passphraseLeastPrivilege,
  passwordLeastPrivilege,
  PassphraseGeneratorOptionsEvaluator,
  PasswordGeneratorOptionsEvaluator,
} from "../policies";
import {
  PassphraseGenerationOptions,
  PassphraseGeneratorPolicy,
  PasswordGenerationOptions,
  PasswordGeneratorPolicy,
  PolicyConfiguration,
} from "../types";

const PASSPHRASE = Object.freeze({
  type: PolicyType.PasswordGenerator,
  disabledValue: Object.freeze({
    minNumberWords: 0,
    capitalize: false,
    includeNumber: false,
  }),
  combine: passphraseLeastPrivilege,
  createEvaluator: (policy) => new PassphraseGeneratorOptionsEvaluator(policy),
  createEvaluatorV2: (policy) => new PassphraseGeneratorOptionsEvaluator(policy),
} as PolicyConfiguration<PassphraseGeneratorPolicy, PassphraseGenerationOptions>);

const PASSWORD = Object.freeze({
  type: PolicyType.PasswordGenerator,
  disabledValue: Object.freeze({
    minLength: 0,
    useUppercase: false,
    useLowercase: false,
    useNumbers: false,
    numberCount: 0,
    useSpecial: false,
    specialCount: 0,
  }),
  combine: passwordLeastPrivilege,
  createEvaluator: (policy) => new PasswordGeneratorOptionsEvaluator(policy),
  createEvaluatorV2: (policy) => new PasswordGeneratorOptionsEvaluator(policy),
} as PolicyConfiguration<PasswordGeneratorPolicy, PasswordGenerationOptions>);

/** Policy configurations */
export const Policies = Object.freeze({
  /** Passphrase policy configuration */
  Passphrase: PASSPHRASE,

  /** Passphrase policy configuration */
  Password: PASSWORD,
});
