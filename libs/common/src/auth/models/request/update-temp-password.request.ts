import { OrganizationUserResetPasswordRequest } from "../../../abstractions/organization-user/requests";

export class UpdateTempPasswordRequest extends OrganizationUserResetPasswordRequest {
  masterPasswordHint: string;
}
