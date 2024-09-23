import { DefaultPassphraseBoundaries, Policies } from "../data";

import { PassphrasePolicyConstraints } from "./passphrase-policy-constraints";

const SomeSettings = {
  capitalize: false,
  includeNumber: false,
  numWords: 3,
  wordSeparator: "-",
};

describe("PassphrasePolicyConstraints", () => {
  describe("constructor", () => {
    it("uses default boundaries when the policy is disabled", () => {
      const { constraints } = new PassphrasePolicyConstraints(Policies.Passphrase.disabledValue);

      expect(constraints.policyInEffect).toBeFalsy();
      expect(constraints.capitalize).toBeUndefined();
      expect(constraints.includeNumber).toBeUndefined();
      expect(constraints.numWords).toEqual(DefaultPassphraseBoundaries.numWords);
    });

    it("requires capitalization when the policy requires capitalization", () => {
      const { constraints } = new PassphrasePolicyConstraints({
        ...Policies.Passphrase.disabledValue,
        capitalize: true,
      });

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.capitalize).toMatchObject({ readonly: true, requiredValue: true });
    });

    it("requires a number when the policy requires a number", () => {
      const { constraints } = new PassphrasePolicyConstraints({
        ...Policies.Passphrase.disabledValue,
        includeNumber: true,
      });

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.includeNumber).toMatchObject({ readonly: true, requiredValue: true });
    });

    it("minNumberWords <= numWords.min  when the policy requires numberCount", () => {
      const { constraints } = new PassphrasePolicyConstraints({
        ...Policies.Passphrase.disabledValue,
        minNumberWords: 10,
      });

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.numWords).toMatchObject({
        min: 10,
        max: DefaultPassphraseBoundaries.numWords.max,
      });
    });
  });

  describe("adjust", () => {
    it("allows an empty word separator", () => {
      const policy = new PassphrasePolicyConstraints(Policies.Passphrase.disabledValue);

      const { wordSeparator } = policy.adjust({ ...SomeSettings, wordSeparator: "" });

      expect(wordSeparator).toEqual("");
    });

    it("takes only the first character of wordSeparator", () => {
      const policy = new PassphrasePolicyConstraints(Policies.Passphrase.disabledValue);

      const { wordSeparator } = policy.adjust({ ...SomeSettings, wordSeparator: "?." });

      expect(wordSeparator).toEqual("?");
    });

    it.each([
      [1, 3],
      [21, 20],
    ])("fits numWords (=%p) within the default bounds (3 <= %p <= 20)", (value, expected) => {
      const policy = new PassphrasePolicyConstraints(Policies.Passphrase.disabledValue);

      const { numWords } = policy.adjust({ ...SomeSettings, numWords: value });

      expect(numWords).toEqual(expected);
    });

    it.each([
      [1, 4, 4],
      [21, 20, 20],
    ])(
      "fits numWords (=%p) within the policy bounds (%p <= %p <= 20)",
      (value, minNumberWords, expected) => {
        const policy = new PassphrasePolicyConstraints({
          ...Policies.Passphrase.disabledValue,
          minNumberWords,
        });

        const { numWords } = policy.adjust({ ...SomeSettings, numWords: value });

        expect(numWords).toEqual(expected);
      },
    );

    it("sets capitalize to true when the policy requires it", () => {
      const policy = new PassphrasePolicyConstraints({
        ...Policies.Passphrase.disabledValue,
        capitalize: true,
      });

      const { capitalize } = policy.adjust({ ...SomeSettings, capitalize: false });

      expect(capitalize).toBeTruthy();
    });

    it("sets includeNumber to true when the policy requires it", () => {
      const policy = new PassphrasePolicyConstraints({
        ...Policies.Passphrase.disabledValue,
        includeNumber: true,
      });

      const { includeNumber } = policy.adjust({ ...SomeSettings, capitalize: false });

      expect(includeNumber).toBeTruthy();
    });
  });

  describe("fix", () => {
    it("returns its input", () => {
      const policy = new PassphrasePolicyConstraints(Policies.Passphrase.disabledValue);

      const result = policy.fix(SomeSettings);

      expect(result).toBe(SomeSettings);
    });
  });
});
