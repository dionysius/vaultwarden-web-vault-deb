import { SecretVerificationRequest } from "../../../models/request/secret-verification.request";

export class OrganizationUserResetPasswordEnrollmentRequest extends SecretVerificationRequest {
  resetPasswordKey: string;
}
