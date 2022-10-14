import Domain from "./domain-base";

export class MasterPasswordPolicyOptions extends Domain {
  minComplexity = 0;
  minLength = 0;
  requireUpper = false;
  requireLower = false;
  requireNumbers = false;
  requireSpecial = false;
}
