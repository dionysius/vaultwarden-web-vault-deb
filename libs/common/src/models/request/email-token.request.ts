import { SecretVerificationRequest } from "./secret-verification.request";

export class EmailTokenRequest extends SecretVerificationRequest {
  newEmail: string;
  masterPasswordHash: string;
}
