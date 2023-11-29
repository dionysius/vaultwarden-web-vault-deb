import { PasswordGeneratorPolicyOptions } from "../../../admin-console/models/domain/password-generator-policy-options";

import { GeneratedPasswordHistory } from "./generated-password-history";
import { PasswordGeneratorOptions } from "./password-generator-options";

export abstract class PasswordGenerationServiceAbstraction {
  generatePassword: (options: PasswordGeneratorOptions) => Promise<string>;
  generatePassphrase: (options: PasswordGeneratorOptions) => Promise<string>;
  getOptions: () => Promise<[PasswordGeneratorOptions, PasswordGeneratorPolicyOptions]>;
  enforcePasswordGeneratorPoliciesOnOptions: (
    options: PasswordGeneratorOptions,
  ) => Promise<[PasswordGeneratorOptions, PasswordGeneratorPolicyOptions]>;
  getPasswordGeneratorPolicyOptions: () => Promise<PasswordGeneratorPolicyOptions>;
  saveOptions: (options: PasswordGeneratorOptions) => Promise<void>;
  getHistory: () => Promise<GeneratedPasswordHistory[]>;
  addHistory: (password: string) => Promise<void>;
  clear: (userId?: string) => Promise<void>;
  normalizeOptions: (
    options: PasswordGeneratorOptions,
    enforcedPolicyOptions: PasswordGeneratorPolicyOptions,
  ) => void;
}
