import { SecretVerificationRequest } from "./secret-verification.request";

export class TwoFactorEmailRequest extends SecretVerificationRequest {
  email: string;
  deviceIdentifier: string;
  authRequestId: string;
}
