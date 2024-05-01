import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import { ServiceAccountProjectAccessPolicyResponse } from "./access-policy.response";

export class ServiceAccountProjectPolicyPermissionDetailsResponse extends BaseResponse {
  accessPolicy: ServiceAccountProjectAccessPolicyResponse;
  hasPermission: boolean;

  constructor(response: any) {
    super(response);
    this.accessPolicy = this.getResponseProperty("AccessPolicy");
    this.hasPermission = this.getResponseProperty("HasPermission");
  }
}
