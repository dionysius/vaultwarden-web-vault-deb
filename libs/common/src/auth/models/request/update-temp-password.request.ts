import { OrganizationUserResetPasswordRequest } from "../../../admin-console/abstractions/organization-user/requests";

export class UpdateTempPasswordRequest extends OrganizationUserResetPasswordRequest {
  masterPasswordHint: string;
}
