import { PasswordGeneratorPolicyOptions } from "../../../admin-console/models/domain/password-generator-policy-options";

import { PasswordGenerationOptions } from "./password-generator-options";

function initializeBoundaries() {
  const length = Object.freeze({
    min: 5,
    max: 128,
  });

  const minDigits = Object.freeze({
    min: 0,
    max: 9,
  });

  const minSpecialCharacters = Object.freeze({
    min: 0,
    max: 9,
  });

  return Object.freeze({
    length,
    minDigits,
    minSpecialCharacters,
  });
}

/** Immutable default boundaries for password generation.
 * These are used when the policy does not override a value.
 */
export const DefaultBoundaries = initializeBoundaries();

type Boundary = {
  readonly min: number;
  readonly max: number;
};

/** Enforces policy for password generation.
 */
export class PasswordGeneratorOptionsEvaluator {
  // This design is not ideal, but it is a step towards a more robust password
  // generator. Ideally, `sanitize` would be implemented on an options class,
  // and `applyPolicy` would be implemented on a policy class, "mise en place".
  //
  // The current design of the password generator, unfortunately, would require
  // a substantial rewrite to make this feasible. Hopefully this change can be
  // applied when the password generator is ported to rust.

  /** Boundaries for the password length. This is always large enough
   * to accommodate the minimum number of digits and special characters.
   */
  readonly length: Boundary;

  /** Boundaries for the minimum number of digits allowed in the password.
   */
  readonly minDigits: Boundary;

  /** Boundaries for the minimum number of special characters allowed
   *  in the password.
   */
  readonly minSpecialCharacters: Boundary;

  /** Policy applied by the evaluator.
   */
  readonly policy: PasswordGeneratorPolicyOptions;

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
    this.minDigits = createBoundary(policy.numberCount, DefaultBoundaries.minDigits);
    this.minSpecialCharacters = createBoundary(
      policy.specialCount,
      DefaultBoundaries.minSpecialCharacters,
    );

    // the overall length should be at least as long as the sum of the minimums
    const minConsistentLength = this.minDigits.min + this.minSpecialCharacters.min;
    const minPolicyLength = policy.minLength > 0 ? policy.minLength : DefaultBoundaries.length.min;
    const minLength = Math.max(minPolicyLength, minConsistentLength, DefaultBoundaries.length.min);

    this.length = {
      min: minLength,
      max: Math.max(DefaultBoundaries.length.max, minLength),
    };
  }

  /** Apply policy to a set of options.
   *  @param options The options to build from. These options are not altered.
   *  @returns A complete password generation request with policy applied.
   *  @remarks This method only applies policy overrides.
   *           Pass the result to `sanitize` to ensure consistency.
   */
  applyPolicy(options: PasswordGenerationOptions): PasswordGenerationOptions {
    function fitToBounds(value: number, boundaries: Boundary) {
      const { min, max } = boundaries;

      const withUpperBound = Math.min(value || 0, max);
      const withLowerBound = Math.max(withUpperBound, min);

      return withLowerBound;
    }

    // apply policy overrides
    const uppercase = this.policy.useUppercase || options.uppercase || false;
    const lowercase = this.policy.useLowercase || options.lowercase || false;

    // these overrides can cascade numeric fields to boolean fields
    const number = this.policy.useNumbers || options.number || options.minNumber > 0;
    const special = this.policy.useSpecial || options.special || options.minSpecial > 0;

    // apply boundaries; the boundaries can cascade boolean fields to numeric fields
    const length = fitToBounds(options.length, this.length);
    const minNumber = fitToBounds(options.minNumber, this.minDigits);
    const minSpecial = fitToBounds(options.minSpecial, this.minSpecialCharacters);

    return {
      ...options,
      length,
      uppercase,
      lowercase,
      number,
      minNumber,
      special,
      minSpecial,
    };
  }

  /** Ensures internal options consistency.
   *  @param options The options to cascade. These options are not altered.
   *  @returns A new password generation request with cascade applied.
   *  @remarks  This method fills null and undefined values by looking at
   *  pairs of flags and values (e.g. `number` and `minNumber`). If the flag
   *  and value are inconsistent, the flag cascades to the value.
   */
  sanitize(options: PasswordGenerationOptions): PasswordGenerationOptions {
    function cascade(enabled: boolean, value: number): [boolean, number] {
      const enabledResult = enabled ?? value > 0;
      const valueResult = enabledResult ? value || 1 : 0;

      return [enabledResult, valueResult];
    }

    const [lowercase, minLowercase] = cascade(options.lowercase, options.minLowercase);
    const [uppercase, minUppercase] = cascade(options.uppercase, options.minUppercase);
    const [number, minNumber] = cascade(options.number, options.minNumber);
    const [special, minSpecial] = cascade(options.special, options.minSpecial);

    // minimums can only increase the length
    const minConsistentLength = minLowercase + minUppercase + minNumber + minSpecial;
    const minLength = Math.max(minConsistentLength, this.length.min);
    const length = Math.max(options.length ?? minLength, minLength);

    return {
      ...options,
      length,
      minLength,
      lowercase,
      minLowercase,
      uppercase,
      minUppercase,
      number,
      minNumber,
      special,
      minSpecial,
    };
  }
}
