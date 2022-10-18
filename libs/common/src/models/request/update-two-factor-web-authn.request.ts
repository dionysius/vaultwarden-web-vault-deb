import { SecretVerificationRequest } from "./secret-verification.request";

export class UpdateTwoFactorWebAuthnRequest extends SecretVerificationRequest {
  deviceResponse: PublicKeyCredential;
  name: string;
  id: number;
}
