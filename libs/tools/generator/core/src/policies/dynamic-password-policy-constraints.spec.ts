import { DefaultPasswordBoundaries, DefaultPasswordGenerationOptions, Policies } from "../data";

import { AtLeastOne } from "./constraints";
import { DynamicPasswordPolicyConstraints } from "./dynamic-password-policy-constraints";

describe("DynamicPasswordPolicyConstraints", () => {
  describe("constructor", () => {
    it("uses default boundaries when the policy is disabled", () => {
      const { constraints } = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);

      expect(constraints.policyInEffect).toBeFalsy();
      expect(constraints.length).toEqual(DefaultPasswordBoundaries.length);
      expect(constraints.lowercase).toBeUndefined();
      expect(constraints.uppercase).toBeUndefined();
      expect(constraints.number).toBeUndefined();
      expect(constraints.special).toBeUndefined();
      expect(constraints.minLowercase).toBeUndefined();
      expect(constraints.minUppercase).toBeUndefined();
      expect(constraints.minNumber).toEqual(DefaultPasswordBoundaries.minDigits);
      expect(constraints.minSpecial).toEqual(DefaultPasswordBoundaries.minSpecialCharacters);
    });

    it("1 <= minLowercase when the policy requires lowercase", () => {
      const policy = { ...Policies.Password.disabledValue, useLowercase: true };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.lowercase.readonly).toEqual(true);
      expect(constraints.lowercase.requiredValue).toEqual(true);
      expect(constraints.minLowercase).toEqual({ min: 1 });
    });

    it("1 <= minUppercase when the policy requires uppercase", () => {
      const policy = { ...Policies.Password.disabledValue, useUppercase: true };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.uppercase.readonly).toEqual(true);
      expect(constraints.uppercase.requiredValue).toEqual(true);
      expect(constraints.minUppercase).toEqual({ min: 1 });
    });

    it("1 <= minNumber <= 9 when the policy requires a number", () => {
      const policy = { ...Policies.Password.disabledValue, useNumbers: true };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.number.readonly).toEqual(true);
      expect(constraints.number.requiredValue).toEqual(true);
      expect(constraints.minNumber).toEqual({ min: 1, max: 9 });
    });

    it("1 <= minSpecial <= 9 when the policy requires a special character", () => {
      const policy = { ...Policies.Password.disabledValue, useSpecial: true };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.special.readonly).toEqual(true);
      expect(constraints.special.requiredValue).toEqual(true);
      expect(constraints.minSpecial).toEqual({ min: 1, max: 9 });
    });

    it("numberCount <= minNumber <= 9 when the policy requires numberCount", () => {
      const policy = { ...Policies.Password.disabledValue, useNumbers: true, numberCount: 2 };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.number.readonly).toEqual(true);
      expect(constraints.number.requiredValue).toEqual(true);
      expect(constraints.minNumber).toEqual({ min: 2, max: 9 });
    });

    it("specialCount <= minSpecial <= 9 when the policy requires specialCount", () => {
      const policy = { ...Policies.Password.disabledValue, useSpecial: true, specialCount: 2 };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.special.readonly).toEqual(true);
      expect(constraints.special.requiredValue).toEqual(true);
      expect(constraints.minSpecial).toEqual({ min: 2, max: 9 });
    });

    it("uses the policy's minimum length when the policy defines one", () => {
      const policy = { ...Policies.Password.disabledValue, minLength: 10 };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      expect(constraints.policyInEffect).toBeTruthy();
      expect(constraints.length).toEqual({ min: 10, max: 128 });
    });

    it("overrides the minimum length when it is less than the sum of minimums", () => {
      const policy = {
        ...Policies.Password.disabledValue,
        useUppercase: true,
        useLowercase: true,
        useNumbers: true,
        numberCount: 5,
        useSpecial: true,
        specialCount: 5,
      };
      const { constraints } = new DynamicPasswordPolicyConstraints(policy);

      // lower + upper + number + special = 1 + 1 + 5 + 5 = 12
      expect(constraints.length).toEqual({ min: 12, max: 128 });
    });
  });

  describe("calibrate", () => {
    it("copies the boolean constraints into the calibration", () => {
      const dynamic = new DynamicPasswordPolicyConstraints({
        ...Policies.Password.disabledValue,
        useUppercase: true,
        useLowercase: true,
        useNumbers: true,
        useSpecial: true,
      });

      const calibrated = dynamic.calibrate(DefaultPasswordGenerationOptions);

      expect(calibrated.constraints.uppercase).toEqual(dynamic.constraints.uppercase);
      expect(calibrated.constraints.lowercase).toEqual(dynamic.constraints.lowercase);
      expect(calibrated.constraints.number).toEqual(dynamic.constraints.number);
      expect(calibrated.constraints.special).toEqual(dynamic.constraints.special);
    });

    it.each([[true], [false], [undefined]])(
      "outputs at least 1 constraint when the state's lowercase flag is true and useLowercase is %p",
      (useLowercase) => {
        const dynamic = new DynamicPasswordPolicyConstraints({
          ...Policies.Password.disabledValue,
          useLowercase,
        });
        const state = {
          ...DefaultPasswordGenerationOptions,
          lowercase: true,
        };

        const calibrated = dynamic.calibrate(state);

        expect(calibrated.constraints.minLowercase).toEqual(AtLeastOne);
      },
    );

    it("outputs the `minLowercase` constraint when the state's lowercase flag is true and policy is disabled", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);
      const state = {
        ...DefaultPasswordGenerationOptions,
        lowercase: true,
      };

      const calibrated = dynamic.calibrate(state);

      expect(calibrated.constraints.minLowercase).toEqual(AtLeastOne);
    });

    it("disables the minLowercase constraint when the state's lowercase flag is false", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);
      const state = {
        ...DefaultPasswordGenerationOptions,
        lowercase: false,
      };

      const calibrated = dynamic.calibrate(state);

      expect(calibrated.constraints.minLowercase).toBeUndefined();
    });

    it.each([[true], [false], [undefined]])(
      "outputs at least 1 constraint when the state's uppercase flag is true and useUppercase is %p",
      (useUppercase) => {
        const dynamic = new DynamicPasswordPolicyConstraints({
          ...Policies.Password.disabledValue,
          useUppercase,
        });
        const state = {
          ...DefaultPasswordGenerationOptions,
          uppercase: true,
        };

        const calibrated = dynamic.calibrate(state);

        expect(calibrated.constraints.minUppercase).toEqual(AtLeastOne);
      },
    );

    it("disables the minUppercase constraint when the state's uppercase flag is false", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);
      const state = {
        ...DefaultPasswordGenerationOptions,
        uppercase: false,
      };

      const calibrated = dynamic.calibrate(state);

      expect(calibrated.constraints.minUppercase).toBeUndefined();
    });

    it("outputs the minNumber constraint when the state's number flag is true", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);
      const state = {
        ...DefaultPasswordGenerationOptions,
        number: true,
      };

      const calibrated = dynamic.calibrate(state);

      expect(calibrated.constraints.minNumber).toEqual(dynamic.constraints.minNumber);
    });

    it("disables the minNumber constraint when the state's number flag is false", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);
      const state = {
        ...DefaultPasswordGenerationOptions,
        number: false,
      };

      const calibrated = dynamic.calibrate(state);

      expect(calibrated.constraints.minNumber).toBeUndefined();
    });

    it("outputs the minSpecial constraint when the state's special flag is true", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);
      const state = {
        ...DefaultPasswordGenerationOptions,
        special: true,
      };

      const calibrated = dynamic.calibrate(state);

      expect(calibrated.constraints.minSpecial).toEqual(dynamic.constraints.minSpecial);
    });

    it("disables the minSpecial constraint when the state's special flag is false", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);
      const state = {
        ...DefaultPasswordGenerationOptions,
        special: false,
      };

      const calibrated = dynamic.calibrate(state);

      expect(calibrated.constraints.minSpecial).toBeUndefined();
    });

    it("copies the minimum length constraint", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);

      const calibrated = dynamic.calibrate(DefaultPasswordGenerationOptions);

      expect(calibrated.constraints.minSpecial).toBeUndefined();
    });

    it("overrides the minimum length constraint when it is less than the sum of the state's minimums", () => {
      const dynamic = new DynamicPasswordPolicyConstraints(Policies.Password.disabledValue);

      const calibrated = dynamic.calibrate(DefaultPasswordGenerationOptions);

      expect(calibrated.constraints.minSpecial).toBeUndefined();
    });
  });
});
