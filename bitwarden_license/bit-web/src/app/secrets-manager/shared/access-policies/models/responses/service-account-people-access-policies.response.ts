import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import {
  GroupServiceAccountAccessPolicyResponse,
  UserServiceAccountAccessPolicyResponse,
} from "./access-policy.response";

export class ServiceAccountPeopleAccessPoliciesResponse extends BaseResponse {
  userAccessPolicies: UserServiceAccountAccessPolicyResponse[];
  groupAccessPolicies: GroupServiceAccountAccessPolicyResponse[];

  constructor(response: any) {
    super(response);
    const userAccessPolicies = this.getResponseProperty("UserAccessPolicies");
    this.userAccessPolicies = userAccessPolicies.map(
      (k: any) => new UserServiceAccountAccessPolicyResponse(k),
    );
    const groupAccessPolicies = this.getResponseProperty("GroupAccessPolicies");
    this.groupAccessPolicies = groupAccessPolicies.map(
      (k: any) => new GroupServiceAccountAccessPolicyResponse(k),
    );
  }
}
