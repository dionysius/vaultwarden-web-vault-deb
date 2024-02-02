/**
 * include structuredClone in test environment.
 * @jest-environment ../../../../shared/test.environment.ts
 */

import { mock } from "jest-mock-extended";

import { PolicyType } from "../../../admin-console/enums";
// FIXME: use index.ts imports once policy abstractions and models
// implement ADR-0002
import { Policy } from "../../../admin-console/models/domain/policy";
import { PASSPHRASE_SETTINGS } from "../key-definitions";
import { PasswordGenerationServiceAbstraction } from "../password/password-generation.service.abstraction";

import { PassphraseGeneratorOptionsEvaluator, PassphraseGeneratorStrategy } from ".";

describe("Password generation strategy", () => {
  describe("evaluator()", () => {
    it("should throw if the policy type is incorrect", () => {
      const strategy = new PassphraseGeneratorStrategy(null);
      const policy = mock<Policy>({
        type: PolicyType.DisableSend,
      });

      expect(() => strategy.evaluator(policy)).toThrow(new RegExp("Mismatched policy type\\. .+"));
    });

    it("should map to the policy evaluator", () => {
      const strategy = new PassphraseGeneratorStrategy(null);
      const policy = mock<Policy>({
        type: PolicyType.PasswordGenerator,
        data: {
          minNumberWords: 10,
          capitalize: true,
          includeNumber: true,
        },
      });

      const evaluator = strategy.evaluator(policy);

      expect(evaluator).toBeInstanceOf(PassphraseGeneratorOptionsEvaluator);
      expect(evaluator.policy).toMatchObject({
        minNumberWords: 10,
        capitalize: true,
        includeNumber: true,
      });
    });
  });

  describe("disk", () => {
    it("should use password settings key", () => {
      const legacy = mock<PasswordGenerationServiceAbstraction>();
      const strategy = new PassphraseGeneratorStrategy(legacy);

      expect(strategy.disk).toBe(PASSPHRASE_SETTINGS);
    });
  });

  describe("cache_ms", () => {
    it("should be a positive non-zero number", () => {
      const legacy = mock<PasswordGenerationServiceAbstraction>();
      const strategy = new PassphraseGeneratorStrategy(legacy);

      expect(strategy.cache_ms).toBeGreaterThan(0);
    });
  });

  describe("policy", () => {
    it("should use password generator policy", () => {
      const legacy = mock<PasswordGenerationServiceAbstraction>();
      const strategy = new PassphraseGeneratorStrategy(legacy);

      expect(strategy.policy).toBe(PolicyType.PasswordGenerator);
    });
  });

  describe("generate()", () => {
    it("should call the legacy service with the given options", async () => {
      const legacy = mock<PasswordGenerationServiceAbstraction>();
      const strategy = new PassphraseGeneratorStrategy(legacy);
      const options = {
        type: "passphrase",
        minNumberWords: 1,
        capitalize: true,
        includeNumber: true,
      };

      await strategy.generate(options);

      expect(legacy.generatePassphrase).toHaveBeenCalledWith(options);
    });

    it("should set the generation type to passphrase", async () => {
      const legacy = mock<PasswordGenerationServiceAbstraction>();
      const strategy = new PassphraseGeneratorStrategy(legacy);

      await strategy.generate({ type: "foo" } as any);

      expect(legacy.generatePassphrase).toHaveBeenCalledWith({ type: "passphrase" });
    });
  });
});
