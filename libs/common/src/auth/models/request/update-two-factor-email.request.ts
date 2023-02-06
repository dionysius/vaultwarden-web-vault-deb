import { SecretVerificationRequest } from "./secret-verification.request";

export class UpdateTwoFactorEmailRequest extends SecretVerificationRequest {
  token: string;
  email: string;
}
