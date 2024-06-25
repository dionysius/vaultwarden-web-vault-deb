import { SecretVerificationRequest } from "./secret-verification.request";

export class UpdateTwoFactorDuoRequest extends SecretVerificationRequest {
  clientId: string;
  clientSecret: string;
  host: string;
}
