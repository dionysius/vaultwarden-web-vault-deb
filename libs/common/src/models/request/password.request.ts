import { SecretVerificationRequest } from "./secret-verification.request";

export class PasswordRequest extends SecretVerificationRequest {
  newMasterPasswordHash: string;
  masterPasswordHint: string;
  key: string;
}
