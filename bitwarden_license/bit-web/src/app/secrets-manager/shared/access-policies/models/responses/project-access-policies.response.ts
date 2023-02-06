import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import {
  GroupProjectAccessPolicyResponse,
  ServiceAccountProjectAccessPolicyResponse,
  UserProjectAccessPolicyResponse,
} from "./access-policy.response";

export class ProjectAccessPoliciesResponse extends BaseResponse {
  userAccessPolicies: UserProjectAccessPolicyResponse[];
  groupAccessPolicies: GroupProjectAccessPolicyResponse[];
  serviceAccountAccessPolicies: ServiceAccountProjectAccessPolicyResponse[];

  constructor(response: any) {
    super(response);
    this.userAccessPolicies = this.getResponseProperty("UserAccessPolicies");
    this.groupAccessPolicies = this.getResponseProperty("GroupAccessPolicies");
    this.serviceAccountAccessPolicies = this.getResponseProperty("ServiceAccountAccessPolicies");
  }
}
