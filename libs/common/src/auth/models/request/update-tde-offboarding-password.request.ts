import { OrganizationUserResetPasswordRequest } from "@bitwarden/admin-console/common";

export class UpdateTdeOffboardingPasswordRequest extends OrganizationUserResetPasswordRequest {
  masterPasswordHint: string;
}
