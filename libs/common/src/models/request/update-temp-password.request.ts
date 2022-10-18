import { OrganizationUserResetPasswordRequest } from "./organization-user-reset-password.request";

export class UpdateTempPasswordRequest extends OrganizationUserResetPasswordRequest {
  masterPasswordHint: string;
}
