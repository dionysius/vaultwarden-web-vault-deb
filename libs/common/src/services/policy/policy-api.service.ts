import { firstValueFrom } from "rxjs";

import { ApiService } from "../../abstractions/api.service";
import { OrganizationService } from "../../abstractions/organization/organization.service.abstraction";
import { PolicyApiServiceAbstraction } from "../../abstractions/policy/policy-api.service.abstraction";
import { InternalPolicyService } from "../../abstractions/policy/policy.service.abstraction";
import { StateService } from "../../abstractions/state.service";
import { PolicyType } from "../../enums/policyType";
import { PolicyData } from "../../models/data/policy.data";
import { MasterPasswordPolicyOptions } from "../../models/domain/master-password-policy-options";
import { PolicyRequest } from "../../models/request/policy.request";
import { ListResponse } from "../../models/response/list.response";
import { PolicyResponse } from "../../models/response/policy.response";

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

  async getMasterPasswordPoliciesForInvitedUsers(
    orgId: string
  ): Promise<MasterPasswordPolicyOptions> {
    const userId = await this.stateService.getUserId();
    const response = await this.getPoliciesByInvitedUser(orgId, userId);
    const policies = await this.policyService.mapPoliciesFromToken(response);
    return await firstValueFrom(this.policyService.masterPasswordPolicyOptions$(policies));
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
