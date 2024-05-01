import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import { ServiceAccountProjectPolicyPermissionDetailsResponse } from "./service-account-project-policy-permission-details.response";

export class ServiceAccountGrantedPoliciesPermissionDetailsResponse extends BaseResponse {
  grantedProjectPolicies: ServiceAccountProjectPolicyPermissionDetailsResponse[];

  constructor(response: any) {
    super(response);
    const grantedProjectPolicies = this.getResponseProperty("GrantedProjectPolicies");
    this.grantedProjectPolicies = grantedProjectPolicies.map(
      (k: any) => new ServiceAccountProjectPolicyPermissionDetailsResponse(k),
    );
  }
}
