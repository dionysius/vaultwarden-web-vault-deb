import { SecretVerificationRequest } from "./secret-verification.request";

export class OrganizationUserResetPasswordEnrollmentRequest extends SecretVerificationRequest {
  resetPasswordKey: string;
}
