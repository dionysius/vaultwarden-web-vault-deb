import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { BaseResponse } from "@bitwarden/node/cli/models/response/baseResponse";

export class OrganizationResponse implements BaseResponse {
  object: string;
  id: string;
  name: string;
  status: OrganizationUserStatusType;
  type: OrganizationUserType;
  enabled: boolean;

  constructor(o: Organization) {
    this.object = "organization";
    this.id = o.id;
    this.name = o.name;
    this.status = o.status;
    this.type = o.type;
    this.enabled = o.enabled;
  }
}
