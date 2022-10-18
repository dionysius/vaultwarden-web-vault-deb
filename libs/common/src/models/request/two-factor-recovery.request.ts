import { SecretVerificationRequest } from "./secret-verification.request";

export class TwoFactorRecoveryRequest extends SecretVerificationRequest {
  recoveryCode: string;
  email: string;
}
