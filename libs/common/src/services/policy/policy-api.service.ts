import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import { InternalPolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { PolicyData } from "@bitwarden/common/models/data/policyData";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/models/domain/masterPasswordPolicyOptions";
import { Policy } from "@bitwarden/common/models/domain/policy";
import { PolicyRequest } from "@bitwarden/common/models/request/policyRequest";
import { ListResponse } from "@bitwarden/common/models/response/listResponse";
import { PolicyResponse } from "@bitwarden/common/models/response/policyResponse";

export class PolicyApiService implements PolicyApiServiceAbstraction {
  constructor(
    private policyService: InternalPolicyService,
    private apiService: ApiService,
    private stateService: StateService,
    private organizationService: OrganizationService
  ) {}

  async getPolicy(organizationId: string, type: PolicyType): Promise<PolicyResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/policies/" + type,
      null,
      true,
      true
    );
    return new PolicyResponse(r);
  }

  async getPolicies(organizationId: string): Promise<ListResponse<PolicyResponse>> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/policies",
      null,
      true,
      true
    );
    return new ListResponse(r, PolicyResponse);
  }

  async getPoliciesByToken(
    organizationId: string,
    token: string,
    email: string,
    organizationUserId: string
  ): Promise<ListResponse<PolicyResponse>> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" +
        organizationId +
        "/policies/token?" +
        "token=" +
        encodeURIComponent(token) +
        "&email=" +
        encodeURIComponent(email) +
        "&organizationUserId=" +
        organizationUserId,
      null,
      false,
      true
    );
    return new ListResponse(r, PolicyResponse);
  }

  async getPoliciesByInvitedUser(
    organizationId: string,
    userId: string
  ): Promise<ListResponse<PolicyResponse>> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/policies/invited-user?" + "userId=" + userId,
      null,
      false,
      true
    );
    return new ListResponse(r, PolicyResponse);
  }

  async getPolicyForOrganization(policyType: PolicyType, organizationId: string): Promise<Policy> {
    const org = await this.organizationService.get(organizationId);
    if (org?.isProviderUser) {
      const orgPolicies = await this.getPolicies(organizationId);
      const policy = orgPolicies.data.find((p) => p.organizationId === organizationId);

      if (policy == null) {
        return null;
      }

      return new Policy(new PolicyData(policy));
    }

    const policies = await this.policyService.getAll(policyType);
    return policies.find((p) => p.organizationId === organizationId);
  }

  async getMasterPasswordPoliciesForInvitedUsers(
    orgId: string
  ): Promise<MasterPasswordPolicyOptions> {
    const userId = await this.stateService.getUserId();
    const response = await this.getPoliciesByInvitedUser(orgId, userId);
    const policies = await this.policyService.mapPoliciesFromToken(response);
    return this.policyService.getMasterPasswordPolicyOptions(policies);
  }

  async putPolicy(organizationId: string, type: PolicyType, request: PolicyRequest): Promise<any> {
    const r = await this.apiService.send(
      "PUT",
      "/organizations/" + organizationId + "/policies/" + type,
      request,
      true,
      true
    );
    const response = new PolicyResponse(r);
    const data = new PolicyData(response);
    await this.policyService.upsert(data);
  }
}
