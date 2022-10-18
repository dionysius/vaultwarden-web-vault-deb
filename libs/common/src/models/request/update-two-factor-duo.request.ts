import { SecretVerificationRequest } from "./secret-verification.request";

export class UpdateTwoFactorDuoRequest extends SecretVerificationRequest {
  integrationKey: string;
  secretKey: string;
  host: string;
}
