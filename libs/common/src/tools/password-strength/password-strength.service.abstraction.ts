import { ZXCVBNResult } from "zxcvbn";

export abstract class PasswordStrengthServiceAbstraction {
  getPasswordStrength: (password: string, email?: string, userInputs?: string[]) => ZXCVBNResult;
}
