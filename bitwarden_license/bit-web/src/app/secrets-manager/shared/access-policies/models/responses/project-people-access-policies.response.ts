import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import {
  GroupProjectAccessPolicyResponse,
  UserProjectAccessPolicyResponse,
} from "./access-policy.response";

export class ProjectPeopleAccessPoliciesResponse extends BaseResponse {
  userAccessPolicies: UserProjectAccessPolicyResponse[];
  groupAccessPolicies: GroupProjectAccessPolicyResponse[];

  constructor(response: any) {
    super(response);
    const userAccessPolicies = this.getResponseProperty("UserAccessPolicies");
    this.userAccessPolicies = userAccessPolicies.map(
      (k: any) => new UserProjectAccessPolicyResponse(k),
    );
    const groupAccessPolicies = this.getResponseProperty("GroupAccessPolicies");
    this.groupAccessPolicies = groupAccessPolicies.map(
      (k: any) => new GroupProjectAccessPolicyResponse(k),
    );
  }
}
