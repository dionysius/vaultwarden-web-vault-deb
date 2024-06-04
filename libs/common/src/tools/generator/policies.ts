import { Policy as AdminPolicy } from "@bitwarden/common/admin-console/models/domain/policy";

import { PassphraseGeneratorOptionsEvaluator, PassphraseGeneratorPolicy } from "./passphrase";
import {
  DisabledPassphraseGeneratorPolicy,
  leastPrivilege as passphraseLeastPrivilege,
} from "./passphrase/passphrase-generator-policy";
import { PasswordGeneratorOptionsEvaluator, PasswordGeneratorPolicy } from "./password";
import {
  DisabledPasswordGeneratorPolicy,
  leastPrivilege as passwordLeastPrivilege,
} from "./password/password-generator-policy";

/** Determines how to construct a password generator policy */
export type PolicyConfiguration<Policy, Evaluator> = {
  /** The value of the policy when it is not in effect. */
  disabledValue: Policy;

  /** Combines multiple policies set by the administrative console into
   *  a single policy.
   */
  combine: (acc: Policy, policy: AdminPolicy) => Policy;

  /** Converts policy service data into an actionable policy.
   */
  createEvaluator: (policy: Policy) => Evaluator;
};

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
