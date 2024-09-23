import { PolicyConstraints, StateConstraints } from "@bitwarden/common/tools/types";

import { DefaultPassphraseBoundaries, DefaultPassphraseGenerationOptions } from "../data";
import { PassphraseGenerationOptions, PassphraseGeneratorPolicy } from "../types";

import { atLeast, enforceConstant, fitLength, fitToBounds, readonlyTrueWhen } from "./constraints";

export class PassphrasePolicyConstraints implements StateConstraints<PassphraseGenerationOptions> {
  /** Creates a passphrase policy constraints
   *  @param policy the password policy to enforce. This cannot be
   *  `null` or `undefined`.
   */
  constructor(readonly policy: PassphraseGeneratorPolicy) {
    this.constraints = {
      policyInEffect: policyInEffect(policy),
      wordSeparator: { minLength: 0, maxLength: 1 },
      capitalize: readonlyTrueWhen(policy.capitalize),
      includeNumber: readonlyTrueWhen(policy.includeNumber),
      numWords: atLeast(policy.minNumberWords, DefaultPassphraseBoundaries.numWords),
    };
  }

  constraints: Readonly<PolicyConstraints<PassphraseGenerationOptions>>;

  adjust(state: PassphraseGenerationOptions): PassphraseGenerationOptions {
    const result: PassphraseGenerationOptions = {
      wordSeparator: fitLength(state.wordSeparator, this.constraints.wordSeparator, {
        fillString: DefaultPassphraseGenerationOptions.wordSeparator,
      }),
      capitalize: enforceConstant(state.capitalize, this.constraints.capitalize),
      includeNumber: enforceConstant(state.includeNumber, this.constraints.includeNumber),
      numWords: fitToBounds(state.numWords, this.constraints.numWords),
    };

    return result;
  }

  fix(state: PassphraseGenerationOptions): PassphraseGenerationOptions {
    return state;
  }
}

function policyInEffect(policy: PassphraseGeneratorPolicy): boolean {
  const policies = [
    policy.capitalize,
    policy.includeNumber,
    policy.minNumberWords > DefaultPassphraseBoundaries.numWords.min,
  ];

  return policies.includes(true);
}
