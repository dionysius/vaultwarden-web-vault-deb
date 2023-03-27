import { OrganizationUserStatusType } from "@bitwarden/common/admin-console/enums/organization-user-status-type";
import { OrganizationUserType } from "@bitwarden/common/admin-console/enums/organization-user-type";

import { BaseResponse } from "../../../models/response/base.response";

export class OrganizationUserResponse implements BaseResponse {
  object: string;
  id: string;
  email: string;
  name: string;
  status: OrganizationUserStatusType;
  type: OrganizationUserType;
  twoFactorEnabled: boolean;

  constructor() {
    this.object = "org-member";
  }
}
