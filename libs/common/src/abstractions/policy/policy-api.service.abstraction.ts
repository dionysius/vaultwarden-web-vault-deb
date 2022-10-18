import { PolicyType } from "../../enums/policyType";
import { MasterPasswordPolicyOptions } from "../../models/domain/master-password-policy-options";
import { PolicyRequest } from "../../models/request/policy.request";
import { ListResponse } from "../../models/response/list.response";
import { PolicyResponse } from "../../models/response/policy.response";

export class PolicyApiServiceAbstraction {
  getPolicy: (organizationId: string, type: PolicyType) => Promise<PolicyResponse>;
  getPolicies: (organizationId: string) => Promise<ListResponse<PolicyResponse>>;
  getPoliciesByToken: (
    organizationId: string,
    token: string,
    email: string,
    organizationUserId: string
  ) => Promise<ListResponse<PolicyResponse>>;
  getPoliciesByInvitedUser: (
    organizationId: string,
    userId: string
  ) => Promise<ListResponse<PolicyResponse>>;
  getMasterPasswordPoliciesForInvitedUsers: (orgId: string) => Promise<MasterPasswordPolicyOptions>;
  putPolicy: (organizationId: string, type: PolicyType, request: PolicyRequest) => Promise<any>;
}
