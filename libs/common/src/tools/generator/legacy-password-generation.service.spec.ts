/**
 * include structuredClone in test environment.
 * @jest-environment ../../../shared/test.environment.ts
 */
import { mock } from "jest-mock-extended";
import { of } from "rxjs";

import { mockAccountServiceWith } from "../../../spec";
import { UserId } from "../../types/guid";

import { GeneratorNavigationService, GeneratorService } from "./abstractions";
import { LegacyPasswordGenerationService } from "./legacy-password-generation.service";
import { DefaultGeneratorNavigation, GeneratorNavigation } from "./navigation/generator-navigation";
import { GeneratorNavigationEvaluator } from "./navigation/generator-navigation-evaluator";
import { GeneratorNavigationPolicy } from "./navigation/generator-navigation-policy";
import {
  DefaultPassphraseGenerationOptions,
  PassphraseGenerationOptions,
  PassphraseGeneratorOptionsEvaluator,
  PassphraseGeneratorPolicy,
} from "./passphrase";
import { DisabledPassphraseGeneratorPolicy } from "./passphrase/passphrase-generator-policy";
import {
  DefaultPasswordGenerationOptions,
  PasswordGenerationOptions,
  PasswordGeneratorOptions,
  PasswordGeneratorOptionsEvaluator,
  PasswordGeneratorPolicy,
} from "./password";
import { DisabledPasswordGeneratorPolicy } from "./password/password-generator-policy";

const SomeUser = "some user" as UserId;

function createPassphraseGenerator(
  options: PassphraseGenerationOptions = {},
  policy: PassphraseGeneratorPolicy = DisabledPassphraseGeneratorPolicy,
) {
  let savedOptions = options;
  const generator = mock<GeneratorService<PassphraseGenerationOptions, PassphraseGeneratorPolicy>>({
    evaluator$(id: UserId) {
      const evaluator = new PassphraseGeneratorOptionsEvaluator(policy);
      return of(evaluator);
    },
    options$(id: UserId) {
      return of(savedOptions);
    },
    defaults$(id: UserId) {
      return of(DefaultPassphraseGenerationOptions);
    },
    saveOptions(userId, options) {
      savedOptions = options;
      return Promise.resolve();
    },
  });

  return generator;
}

function createPasswordGenerator(
  options: PasswordGenerationOptions = {},
  policy: PasswordGeneratorPolicy = DisabledPasswordGeneratorPolicy,
) {
  let savedOptions = options;
  const generator = mock<GeneratorService<PasswordGenerationOptions, PasswordGeneratorPolicy>>({
    evaluator$(id: UserId) {
      const evaluator = new PasswordGeneratorOptionsEvaluator(policy);
      return of(evaluator);
    },
    options$(id: UserId) {
      return of(savedOptions);
    },
    defaults$(id: UserId) {
      return of(DefaultPasswordGenerationOptions);
    },
    saveOptions(userId, options) {
      savedOptions = options;
      return Promise.resolve();
    },
  });

  return generator;
}

function createNavigationGenerator(
  options: GeneratorNavigation = {},
  policy: GeneratorNavigationPolicy = {},
) {
  let savedOptions = options;
  const generator = mock<GeneratorNavigationService>({
    evaluator$(id: UserId) {
      const evaluator = new GeneratorNavigationEvaluator(policy);
      return of(evaluator);
    },
    options$(id: UserId) {
      return of(savedOptions);
    },
    defaults$(id: UserId) {
      return of(DefaultGeneratorNavigation);
    },
    saveOptions(userId, options) {
      savedOptions = options;
      return Promise.resolve();
    },
  });

  return generator;
}

describe("LegacyPasswordGenerationService", () => {
  // NOTE: in all tests, `null` constructor arguments are not used by the test.
  // They're set to `null` to avoid setting up unnecessary mocks.

  describe("generatePassword", () => {
    it("invokes the inner password generator to generate passwords", async () => {
      const innerPassword = createPasswordGenerator();
      const generator = new LegacyPasswordGenerationService(null, null, innerPassword, null);
      const options = { type: "password" } as PasswordGeneratorOptions;

      await generator.generatePassword(options);

      expect(innerPassword.generate).toHaveBeenCalledWith(options);
    });

    it("invokes the inner passphrase generator to generate passphrases", async () => {
      const innerPassphrase = createPassphraseGenerator();
      const generator = new LegacyPasswordGenerationService(null, null, null, innerPassphrase);
      const options = { type: "passphrase" } as PasswordGeneratorOptions;

      await generator.generatePassword(options);

      expect(innerPassphrase.generate).toHaveBeenCalledWith(options);
    });
  });

  describe("generatePassphrase", () => {
    it("invokes the inner passphrase generator", async () => {
      const innerPassphrase = createPassphraseGenerator();
      const generator = new LegacyPasswordGenerationService(null, null, null, innerPassphrase);
      const options = {} as PasswordGeneratorOptions;

      await generator.generatePassphrase(options);

      expect(innerPassphrase.generate).toHaveBeenCalledWith(options);
    });
  });

  describe("getOptions", () => {
    it("combines options from its inner services", async () => {
      const innerPassword = createPasswordGenerator({
        length: 29,
        minLength: 20,
        ambiguous: false,
        uppercase: true,
        minUppercase: 1,
        lowercase: false,
        minLowercase: 2,
        number: true,
        minNumber: 3,
        special: false,
        minSpecial: 4,
      });
      const innerPassphrase = createPassphraseGenerator({
        numWords: 10,
        wordSeparator: "-",
        capitalize: true,
        includeNumber: false,
      });
      const navigation = createNavigationGenerator({
        type: "passphrase",
        username: "word",
        forwarder: "simplelogin",
      });
      const accountService = mockAccountServiceWith(SomeUser);
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );

      const [result] = await generator.getOptions();

      expect(result).toEqual({
        type: "passphrase",
        username: "word",
        forwarder: "simplelogin",
        length: 29,
        minLength: 20,
        ambiguous: false,
        uppercase: true,
        minUppercase: 1,
        lowercase: false,
        minLowercase: 2,
        number: true,
        minNumber: 3,
        special: false,
        minSpecial: 4,
        numWords: 10,
        wordSeparator: "-",
        capitalize: true,
        includeNumber: false,
      });
    });

    it("sets default options when an inner service lacks a value", async () => {
      const innerPassword = createPasswordGenerator(null);
      const innerPassphrase = createPassphraseGenerator(null);
      const navigation = createNavigationGenerator(null);
      const accountService = mockAccountServiceWith(SomeUser);
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );

      const [result] = await generator.getOptions();

      expect(result).toEqual({
        ...DefaultGeneratorNavigation,
        ...DefaultPassphraseGenerationOptions,
        ...DefaultPasswordGenerationOptions,
      });
    });

    it("combines policies from its inner services", async () => {
      const innerPassword = createPasswordGenerator(
        {},
        {
          minLength: 20,
          numberCount: 10,
          specialCount: 11,
          useUppercase: true,
          useLowercase: false,
          useNumbers: true,
          useSpecial: false,
        },
      );
      const innerPassphrase = createPassphraseGenerator(
        {},
        {
          minNumberWords: 5,
          capitalize: true,
          includeNumber: false,
        },
      );
      const accountService = mockAccountServiceWith(SomeUser);
      const navigation = createNavigationGenerator(
        {},
        {
          defaultType: "password",
        },
      );
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );

      const [, policy] = await generator.getOptions();

      expect(policy).toEqual({
        defaultType: "password",
        minLength: 20,
        numberCount: 10,
        specialCount: 11,
        useUppercase: true,
        useLowercase: false,
        useNumbers: true,
        useSpecial: false,
        minNumberWords: 5,
        capitalize: true,
        includeNumber: false,
      });
    });
  });

  describe("enforcePasswordGeneratorPoliciesOnOptions", () => {
    it("returns its options parameter with password policy applied", async () => {
      const innerPassword = createPasswordGenerator(
        {},
        {
          minLength: 15,
          numberCount: 5,
          specialCount: 5,
          useUppercase: true,
          useLowercase: true,
          useNumbers: true,
          useSpecial: true,
        },
      );
      const innerPassphrase = createPassphraseGenerator();
      const accountService = mockAccountServiceWith(SomeUser);
      const navigation = createNavigationGenerator();
      const options = {
        type: "password" as const,
      };
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );

      const [result] = await generator.enforcePasswordGeneratorPoliciesOnOptions(options);

      expect(result).toBe(options);
      expect(result).toMatchObject({
        length: 15,
        minLength: 15,
        minLowercase: 1,
        minNumber: 5,
        minUppercase: 1,
        minSpecial: 5,
        uppercase: true,
        lowercase: true,
        number: true,
        special: true,
      });
    });

    it("returns its options parameter with passphrase policy applied", async () => {
      const innerPassword = createPasswordGenerator();
      const innerPassphrase = createPassphraseGenerator(
        {},
        {
          minNumberWords: 5,
          capitalize: true,
          includeNumber: true,
        },
      );
      const accountService = mockAccountServiceWith(SomeUser);
      const navigation = createNavigationGenerator();
      const options = {
        type: "passphrase" as const,
      };
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );

      const [result] = await generator.enforcePasswordGeneratorPoliciesOnOptions(options);

      expect(result).toBe(options);
      expect(result).toMatchObject({
        numWords: 5,
        capitalize: true,
        includeNumber: true,
      });
    });

    it("returns the applied policy", async () => {
      const innerPassword = createPasswordGenerator(
        {},
        {
          minLength: 20,
          numberCount: 10,
          specialCount: 11,
          useUppercase: true,
          useLowercase: false,
          useNumbers: true,
          useSpecial: false,
        },
      );
      const innerPassphrase = createPassphraseGenerator(
        {},
        {
          minNumberWords: 5,
          capitalize: true,
          includeNumber: false,
        },
      );
      const accountService = mockAccountServiceWith(SomeUser);
      const navigation = createNavigationGenerator(
        {},
        {
          defaultType: "password",
        },
      );
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );

      const [, policy] = await generator.enforcePasswordGeneratorPoliciesOnOptions({});

      expect(policy).toEqual({
        defaultType: "password",
        minLength: 20,
        numberCount: 10,
        specialCount: 11,
        useUppercase: true,
        useLowercase: false,
        useNumbers: true,
        useSpecial: false,
        minNumberWords: 5,
        capitalize: true,
        includeNumber: false,
      });
    });
  });

  describe("saveOptions", () => {
    it("loads saved password options", async () => {
      const innerPassword = createPasswordGenerator();
      const innerPassphrase = createPassphraseGenerator();
      const navigation = createNavigationGenerator();
      const accountService = mockAccountServiceWith(SomeUser);
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );
      const options = {
        type: "password" as const,
        username: "word" as const,
        forwarder: "simplelogin" as const,
        length: 29,
        minLength: 20,
        ambiguous: false,
        uppercase: true,
        minUppercase: 1,
        lowercase: false,
        minLowercase: 2,
        number: true,
        minNumber: 3,
        special: false,
        minSpecial: 4,
      };
      await generator.saveOptions(options);

      const [result] = await generator.getOptions();

      expect(result).toMatchObject(options);
    });

    it("loads saved passphrase options", async () => {
      const innerPassword = createPasswordGenerator();
      const innerPassphrase = createPassphraseGenerator();
      const navigation = createNavigationGenerator();
      const accountService = mockAccountServiceWith(SomeUser);
      const generator = new LegacyPasswordGenerationService(
        accountService,
        navigation,
        innerPassword,
        innerPassphrase,
      );
      const options = {
        type: "passphrase" as const,
        username: "word" as const,
        forwarder: "simplelogin" as const,
        numWords: 10,
        wordSeparator: "-",
        capitalize: true,
        includeNumber: false,
      };
      await generator.saveOptions(options);

      const [result] = await generator.getOptions();

      expect(result).toMatchObject(options);
    });
  });
});
