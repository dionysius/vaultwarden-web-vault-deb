import { PasswordGeneratorPolicyOptions } from "../../../admin-console/models/domain/password-generator-policy-options";

import { PassphraseGenerationOptions } from "./password-generator-options";

type Boundary = {
  readonly min: number;
  readonly max: number;
};

function initializeBoundaries() {
  const numWords = Object.freeze({
    min: 3,
    max: 20,
  });

  return Object.freeze({
    numWords,
  });
}

/** Immutable default boundaries for passphrase generation.
 * These are used when the policy does not override a value.
 */
export const DefaultBoundaries = initializeBoundaries();

/** Enforces policy for passphrase generation options.
 */
export class PassphraseGeneratorOptionsEvaluator {
  // This design is not ideal, but it is a step towards a more robust passphrase
  // generator. Ideally, `sanitize` would be implemented on an options class,
  // and `applyPolicy` would be implemented on a policy class, "mise en place".
  //
  // The current design of the passphrase generator, unfortunately, would require
  // a substantial rewrite to make this feasible. Hopefully this change can be
  // applied when the passphrase generator is ported to rust.

  /** Policy applied by the evaluator.
   */
  readonly policy: PasswordGeneratorPolicyOptions;

  /** Boundaries for the number of words allowed in the password.
   */
  readonly numWords: Boundary;

  /** Instantiates the evaluator.
   * @param policy The policy applied by the evaluator. When this conflicts with
   *               the defaults, the policy takes precedence.
   */
  constructor(policy: PasswordGeneratorPolicyOptions) {
    function createBoundary(value: number, defaultBoundary: Boundary): Boundary {
      const boundary = {
        min: Math.max(defaultBoundary.min, value),
        max: Math.max(defaultBoundary.max, value),
      };

      return boundary;
    }

    this.policy = policy.clone();
    this.numWords = createBoundary(policy.minNumberWords, DefaultBoundaries.numWords);
  }

  /** Apply policy to the input options.
   *  @param options The options to build from. These options are not altered.
   *  @returns A new password generation request with policy applied.
   */
  applyPolicy(options: PassphraseGenerationOptions): PassphraseGenerationOptions {
    function fitToBounds(value: number, boundaries: Boundary) {
      const { min, max } = boundaries;

      const withUpperBound = Math.min(value ?? boundaries.min, max);
      const withLowerBound = Math.max(withUpperBound, min);

      return withLowerBound;
    }

    // apply policy overrides
    const capitalize = this.policy.capitalize || options.capitalize || false;
    const includeNumber = this.policy.includeNumber || options.includeNumber || false;

    // apply boundaries
    const numWords = fitToBounds(options.numWords, this.numWords);

    return {
      ...options,
      numWords,
      capitalize,
      includeNumber,
    };
  }

  /** Ensures internal options consistency.
   *  @param options The options to cascade. These options are not altered.
   *  @returns A passphrase generation request with cascade applied.
   */
  sanitize(options: PassphraseGenerationOptions): PassphraseGenerationOptions {
    // ensure words are separated by a single character
    const wordSeparator = options.wordSeparator?.[0] ?? "-";

    return {
      ...options,
      wordSeparator,
    };
  }
}
