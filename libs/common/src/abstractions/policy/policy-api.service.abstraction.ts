import { PolicyType } from "../../enums/policyType";
import { MasterPasswordPolicyOptions } from "../../models/domain/masterPasswordPolicyOptions";
import { Policy } from "../../models/domain/policy";
import { PolicyRequest } from "../../models/request/policyRequest";
import { ListResponse } from "../../models/response/listResponse";
import { PolicyResponse } from "../../models/response/policyResponse";

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
  getPolicyForOrganization: (policyType: PolicyType, organizationId: string) => Promise<Policy>;
  getMasterPasswordPoliciesForInvitedUsers: (orgId: string) => Promise<MasterPasswordPolicyOptions>;
  putPolicy: (organizationId: string, type: PolicyType, request: PolicyRequest) => Promise<any>;
}
