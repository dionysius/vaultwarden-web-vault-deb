import { DefaultGeneratorNavigation } from "./default-generator-navigation";
import { GeneratorNavigationEvaluator } from "./generator-navigation-evaluator";

describe("GeneratorNavigationEvaluator", () => {
  describe("policyInEffect", () => {
    it.each([["passphrase"], ["password"]] as const)(
      "returns true if the policy has a defaultType (= %p)",
      (defaultType) => {
        const evaluator = new GeneratorNavigationEvaluator({ defaultType });

        expect(evaluator.policyInEffect).toEqual(true);
      },
    );

    it.each([[undefined], [null], ["" as any]])(
      "returns false if the policy has a falsy defaultType (= %p)",
      (defaultType) => {
        const evaluator = new GeneratorNavigationEvaluator({ defaultType });

        expect(evaluator.policyInEffect).toEqual(false);
      },
    );
  });

  describe("applyPolicy", () => {
    it("returns the input options", () => {
      const evaluator = new GeneratorNavigationEvaluator(null);
      const options = { type: "password" as const };

      const result = evaluator.applyPolicy(options);

      expect(result).toEqual(options);
    });
  });

  describe("sanitize", () => {
    it.each([["passphrase"], ["password"]] as const)(
      "defaults options to the policy's default type (= %p) when a policy is in effect",
      (defaultType) => {
        const evaluator = new GeneratorNavigationEvaluator({ defaultType });

        const result = evaluator.sanitize({});

        expect(result).toEqual({ type: defaultType });
      },
    );

    it("defaults options to the default generator navigation type when a policy is not in effect", () => {
      const evaluator = new GeneratorNavigationEvaluator(null);

      const result = evaluator.sanitize({});

      expect(result.type).toEqual(DefaultGeneratorNavigation.type);
    });

    it("retains the options type when it is set", () => {
      const evaluator = new GeneratorNavigationEvaluator({ defaultType: "passphrase" });

      const result = evaluator.sanitize({ type: "password" });

      expect(result).toEqual({ type: "password" });
    });
  });
});
