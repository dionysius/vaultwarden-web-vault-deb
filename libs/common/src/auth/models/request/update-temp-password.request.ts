import { OrganizationUserResetPasswordRequest } from "@bitwarden/admin-console/common";

export class UpdateTempPasswordRequest extends OrganizationUserResetPasswordRequest {
  masterPasswordHint: string;
}
