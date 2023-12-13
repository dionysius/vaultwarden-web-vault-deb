import { PasswordGeneratorPolicyOptions } from "../../../admin-console/models/domain/password-generator-policy-options";

import {
  DefaultBoundaries,
  PassphraseGeneratorOptionsEvaluator,
} from "./passphrase-generator-options-evaluator";
import { PassphraseGenerationOptions } from "./password-generator-options";

describe("Password generator options builder", () => {
  describe("constructor()", () => {
    it("should set the policy object to a copy of the input policy", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      policy.minLength = 10; // arbitrary change for deep equality check

      const builder = new PassphraseGeneratorOptionsEvaluator(policy);

      expect(builder.policy).toEqual(policy);
      expect(builder.policy).not.toBe(policy);
    });

    it("should set default boundaries when a default policy is used", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);

      expect(builder.numWords).toEqual(DefaultBoundaries.numWords);
    });

    it.each([1, 2])(
      "should use the default word boundaries when they are greater than `policy.minNumberWords` (= %i)",
      (minNumberWords) => {
        const policy = new PasswordGeneratorPolicyOptions();
        policy.minNumberWords = minNumberWords;

        const builder = new PassphraseGeneratorOptionsEvaluator(policy);

        expect(builder.numWords).toEqual(DefaultBoundaries.numWords);
      },
    );

    it.each([8, 12, 18])(
      "should use `policy.minNumberWords` (= %i) when it is greater than the default minimum words",
      (minNumberWords) => {
        const policy = new PasswordGeneratorPolicyOptions();
        policy.minNumberWords = minNumberWords;

        const builder = new PassphraseGeneratorOptionsEvaluator(policy);

        expect(builder.numWords.min).toEqual(minNumberWords);
        expect(builder.numWords.max).toEqual(DefaultBoundaries.numWords.max);
      },
    );

    it.each([150, 300, 9000])(
      "should use `policy.minNumberWords` (= %i) when it is greater than the default boundaries",
      (minNumberWords) => {
        const policy = new PasswordGeneratorPolicyOptions();
        policy.minNumberWords = minNumberWords;

        const builder = new PassphraseGeneratorOptionsEvaluator(policy);

        expect(builder.numWords.min).toEqual(minNumberWords);
        expect(builder.numWords.max).toEqual(minNumberWords);
      },
    );
  });

  describe("applyPolicy(options)", () => {
    // All tests should freeze the options to ensure they are not modified

    it("should set `capitalize` to `false` when the policy does not override it", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({});

      const sanitizedOptions = builder.applyPolicy(options);

      expect(sanitizedOptions.capitalize).toBe(false);
    });

    it("should set `capitalize` to `true` when the policy overrides it", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      policy.capitalize = true;
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({ capitalize: false });

      const sanitizedOptions = builder.applyPolicy(options);

      expect(sanitizedOptions.capitalize).toBe(true);
    });

    it("should set `includeNumber` to false when the policy does not override it", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({});

      const sanitizedOptions = builder.applyPolicy(options);

      expect(sanitizedOptions.includeNumber).toBe(false);
    });

    it("should set `includeNumber` to true when the policy overrides it", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      policy.includeNumber = true;
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({ includeNumber: false });

      const sanitizedOptions = builder.applyPolicy(options);

      expect(sanitizedOptions.includeNumber).toBe(true);
    });

    it("should set `numWords` to the minimum value when it isn't supplied", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({});

      const sanitizedOptions = builder.applyPolicy(options);

      expect(sanitizedOptions.numWords).toBe(builder.numWords.min);
    });

    it.each([1, 2])(
      "should set `numWords` (= %i) to the minimum value when it is less than the minimum",
      (numWords) => {
        expect(numWords).toBeLessThan(DefaultBoundaries.numWords.min);

        const policy = new PasswordGeneratorPolicyOptions();
        const builder = new PassphraseGeneratorOptionsEvaluator(policy);
        const options = Object.freeze({ numWords });

        const sanitizedOptions = builder.applyPolicy(options);

        expect(sanitizedOptions.numWords).toBe(builder.numWords.min);
      },
    );

    it.each([3, 8, 18, 20])(
      "should set `numWords` (= %i) to the input value when it is within the boundaries",
      (numWords) => {
        expect(numWords).toBeGreaterThanOrEqual(DefaultBoundaries.numWords.min);
        expect(numWords).toBeLessThanOrEqual(DefaultBoundaries.numWords.max);

        const policy = new PasswordGeneratorPolicyOptions();
        const builder = new PassphraseGeneratorOptionsEvaluator(policy);
        const options = Object.freeze({ numWords });

        const sanitizedOptions = builder.applyPolicy(options);

        expect(sanitizedOptions.numWords).toBe(numWords);
      },
    );

    it.each([21, 30, 50, 100])(
      "should set `numWords` (= %i) to the maximum value when it is greater than the maximum",
      (numWords) => {
        expect(numWords).toBeGreaterThan(DefaultBoundaries.numWords.max);

        const policy = new PasswordGeneratorPolicyOptions();
        const builder = new PassphraseGeneratorOptionsEvaluator(policy);
        const options = Object.freeze({ numWords });

        const sanitizedOptions = builder.applyPolicy(options);

        expect(sanitizedOptions.numWords).toBe(builder.numWords.max);
      },
    );

    it("should preserve unknown properties", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({
        unknown: "property",
        another: "unknown property",
      }) as PassphraseGenerationOptions;

      const sanitizedOptions: any = builder.applyPolicy(options);

      expect(sanitizedOptions.unknown).toEqual("property");
      expect(sanitizedOptions.another).toEqual("unknown property");
    });
  });

  describe("sanitize(options)", () => {
    // All tests should freeze the options to ensure they are not modified

    it("should return the input options without altering them", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({ wordSeparator: "%" });

      const sanitizedOptions = builder.sanitize(options);

      expect(sanitizedOptions).toEqual(options);
    });

    it("should set `wordSeparator` to '-' when it isn't supplied and there is no policy override", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({});

      const sanitizedOptions = builder.sanitize(options);

      expect(sanitizedOptions.wordSeparator).toEqual("-");
    });

    it("should preserve unknown properties", () => {
      const policy = new PasswordGeneratorPolicyOptions();
      const builder = new PassphraseGeneratorOptionsEvaluator(policy);
      const options = Object.freeze({
        unknown: "property",
        another: "unknown property",
      }) as PassphraseGenerationOptions;

      const sanitizedOptions: any = builder.sanitize(options);

      expect(sanitizedOptions.unknown).toEqual("property");
      expect(sanitizedOptions.another).toEqual("unknown property");
    });
  });
});
