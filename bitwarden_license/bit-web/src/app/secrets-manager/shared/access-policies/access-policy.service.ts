import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import {
  UserProjectAccessPolicyView,
  GroupProjectAccessPolicyView,
  UserServiceAccountAccessPolicyView,
  GroupServiceAccountAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
} from "../../models/view/access-policies/access-policy.view";
import { PotentialGranteeView } from "../../models/view/access-policies/potential-grantee.view";
import { ProjectPeopleAccessPoliciesView } from "../../models/view/access-policies/project-people-access-policies.view";
import { ProjectServiceAccountsAccessPoliciesView } from "../../models/view/access-policies/project-service-accounts-access-policies.view";
import {
  ServiceAccountGrantedPoliciesView,
  ServiceAccountProjectPolicyPermissionDetailsView,
} from "../../models/view/access-policies/service-account-granted-policies.view";
import { ServiceAccountPeopleAccessPoliciesView } from "../../models/view/access-policies/service-account-people-access-policies.view";
import { PeopleAccessPoliciesRequest } from "../../shared/access-policies/models/requests/people-access-policies.request";
import { ServiceAccountGrantedPoliciesRequest } from "../access-policies/models/requests/service-account-granted-policies.request";

import { AccessPolicyRequest } from "./models/requests/access-policy.request";
import { ProjectServiceAccountsAccessPoliciesRequest } from "./models/requests/project-service-accounts-access-policies.request";
import {
  GroupServiceAccountAccessPolicyResponse,
  UserServiceAccountAccessPolicyResponse,
  GroupProjectAccessPolicyResponse,
  ServiceAccountProjectAccessPolicyResponse,
  UserProjectAccessPolicyResponse,
} from "./models/responses/access-policy.response";
import { PotentialGranteeResponse } from "./models/responses/potential-grantee.response";
import { ProjectPeopleAccessPoliciesResponse } from "./models/responses/project-people-access-policies.response";
import { ProjectServiceAccountsAccessPoliciesResponse } from "./models/responses/project-service-accounts-access-policies.response";
import { ServiceAccountGrantedPoliciesPermissionDetailsResponse } from "./models/responses/service-account-granted-policies-permission-details.response";
import { ServiceAccountPeopleAccessPoliciesResponse } from "./models/responses/service-account-people-access-policies.response";
import { ServiceAccountProjectPolicyPermissionDetailsResponse } from "./models/responses/service-account-project-policy-permission-details.response";

@Injectable({
  providedIn: "root",
})
export class AccessPolicyService {
  constructor(
    private cryptoService: CryptoService,
    protected apiService: ApiService,
    protected encryptService: EncryptService,
  ) {}

  async getProjectPeopleAccessPolicies(
    projectId: string,
  ): Promise<ProjectPeopleAccessPoliciesView> {
    const r = await this.apiService.send(
      "GET",
      "/projects/" + projectId + "/access-policies/people",
      null,
      true,
      true,
    );

    const results = new ProjectPeopleAccessPoliciesResponse(r);
    return this.createProjectPeopleAccessPoliciesView(results);
  }

  async putProjectPeopleAccessPolicies(
    projectId: string,
    peoplePoliciesView: ProjectPeopleAccessPoliciesView,
  ) {
    const request = this.getPeopleAccessPoliciesRequest(peoplePoliciesView);
    const r = await this.apiService.send(
      "PUT",
      "/projects/" + projectId + "/access-policies/people",
      request,
      true,
      true,
    );
    const results = new ProjectPeopleAccessPoliciesResponse(r);
    return this.createProjectPeopleAccessPoliciesView(results);
  }

  async getServiceAccountPeopleAccessPolicies(
    serviceAccountId: string,
  ): Promise<ServiceAccountPeopleAccessPoliciesView> {
    const r = await this.apiService.send(
      "GET",
      "/service-accounts/" + serviceAccountId + "/access-policies/people",
      null,
      true,
      true,
    );

    const results = new ServiceAccountPeopleAccessPoliciesResponse(r);
    return this.createServiceAccountPeopleAccessPoliciesView(results);
  }

  async putServiceAccountPeopleAccessPolicies(
    serviceAccountId: string,
    peoplePoliciesView: ServiceAccountPeopleAccessPoliciesView,
  ) {
    const request = this.getPeopleAccessPoliciesRequest(peoplePoliciesView);
    const r = await this.apiService.send(
      "PUT",
      "/service-accounts/" + serviceAccountId + "/access-policies/people",
      request,
      true,
      true,
    );
    const results = new ServiceAccountPeopleAccessPoliciesResponse(r);
    return this.createServiceAccountPeopleAccessPoliciesView(results);
  }

  async getServiceAccountGrantedPolicies(
    organizationId: string,
    serviceAccountId: string,
  ): Promise<ServiceAccountGrantedPoliciesView> {
    const r = await this.apiService.send(
      "GET",
      "/service-accounts/" + serviceAccountId + "/granted-policies",
      null,
      true,
      true,
    );

    const result = new ServiceAccountGrantedPoliciesPermissionDetailsResponse(r);
    return await this.createServiceAccountGrantedPoliciesView(result, organizationId);
  }

  async putServiceAccountGrantedPolicies(
    organizationId: string,
    serviceAccountId: string,
    policies: ServiceAccountGrantedPoliciesView,
  ): Promise<ServiceAccountGrantedPoliciesView> {
    const request = this.getServiceAccountGrantedPoliciesRequest(policies);
    const r = await this.apiService.send(
      "PUT",
      "/service-accounts/" + serviceAccountId + "/granted-policies",
      request,
      true,
      true,
    );

    const result = new ServiceAccountGrantedPoliciesPermissionDetailsResponse(r);
    return await this.createServiceAccountGrantedPoliciesView(result, organizationId);
  }

  async getProjectServiceAccountsAccessPolicies(
    organizationId: string,
    projectId: string,
  ): Promise<ProjectServiceAccountsAccessPoliciesView> {
    const r = await this.apiService.send(
      "GET",
      "/projects/" + projectId + "/access-policies/service-accounts",
      null,
      true,
      true,
    );

    const result = new ProjectServiceAccountsAccessPoliciesResponse(r);
    return await this.createProjectServiceAccountsAccessPoliciesView(result, organizationId);
  }

  async putProjectServiceAccountsAccessPolicies(
    organizationId: string,
    projectId: string,
    policies: ProjectServiceAccountsAccessPoliciesView,
  ): Promise<ProjectServiceAccountsAccessPoliciesView> {
    const request = this.getProjectServiceAccountsAccessPoliciesRequest(policies);
    const r = await this.apiService.send(
      "PUT",
      "/projects/" + projectId + "/access-policies/service-accounts",
      request,
      true,
      true,
    );

    const result = new ProjectServiceAccountsAccessPoliciesResponse(r);
    return await this.createProjectServiceAccountsAccessPoliciesView(result, organizationId);
  }

  async getPeoplePotentialGrantees(organizationId: string) {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/access-policies/people/potential-grantees",
      null,
      true,
      true,
    );
    const results = new ListResponse(r, PotentialGranteeResponse);
    return await this.createPotentialGranteeViews(organizationId, results.data);
  }

  async getServiceAccountsPotentialGrantees(organizationId: string) {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/access-policies/service-accounts/potential-grantees",
      null,
      true,
      true,
    );
    const results = new ListResponse(r, PotentialGranteeResponse);
    return await this.createPotentialGranteeViews(organizationId, results.data);
  }

  async getProjectsPotentialGrantees(organizationId: string) {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/access-policies/projects/potential-grantees",
      null,
      true,
      true,
    );
    const results = new ListResponse(r, PotentialGranteeResponse);
    return await this.createPotentialGranteeViews(organizationId, results.data);
  }

  private async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  private getAccessPolicyRequest(
    granteeId: string,
    view:
      | UserProjectAccessPolicyView
      | UserServiceAccountAccessPolicyView
      | GroupProjectAccessPolicyView
      | GroupServiceAccountAccessPolicyView
      | ServiceAccountProjectAccessPolicyView,
  ) {
    const request = new AccessPolicyRequest();
    request.granteeId = granteeId;
    request.read = view.read;
    request.write = view.write;
    return request;
  }

  private getServiceAccountGrantedPoliciesRequest(
    policies: ServiceAccountGrantedPoliciesView,
  ): ServiceAccountGrantedPoliciesRequest {
    const request = new ServiceAccountGrantedPoliciesRequest();

    request.projectGrantedPolicyRequests = policies.grantedProjectPolicies.map((detailView) => ({
      grantedId: detailView.accessPolicy.grantedProjectId,
      read: detailView.accessPolicy.read,
      write: detailView.accessPolicy.write,
    }));

    return request;
  }

  private getProjectServiceAccountsAccessPoliciesRequest(
    policies: ProjectServiceAccountsAccessPoliciesView,
  ): ProjectServiceAccountsAccessPoliciesRequest {
    const request = new ProjectServiceAccountsAccessPoliciesRequest();

    request.serviceAccountAccessPolicyRequests = policies.serviceAccountAccessPolicies.map((ap) => {
      return this.getAccessPolicyRequest(ap.serviceAccountId, ap);
    });

    return request;
  }

  private getPeopleAccessPoliciesRequest(
    view: ProjectPeopleAccessPoliciesView | ServiceAccountPeopleAccessPoliciesView,
  ): PeopleAccessPoliciesRequest {
    const request = new PeopleAccessPoliciesRequest();

    if (view.userAccessPolicies?.length > 0) {
      request.userAccessPolicyRequests = view.userAccessPolicies.map((ap) => {
        return this.getAccessPolicyRequest(ap.organizationUserId, ap);
      });
    }

    if (view.groupAccessPolicies?.length > 0) {
      request.groupAccessPolicyRequests = view.groupAccessPolicies.map((ap) => {
        return this.getAccessPolicyRequest(ap.groupId, ap);
      });
    }

    return request;
  }

  private createBaseAccessPolicyView(
    response:
      | UserProjectAccessPolicyResponse
      | UserServiceAccountAccessPolicyResponse
      | GroupProjectAccessPolicyResponse
      | GroupServiceAccountAccessPolicyResponse
      | ServiceAccountProjectAccessPolicyResponse,
  ) {
    return {
      id: response.id,
      read: response.read,
      write: response.write,
      creationDate: response.creationDate,
      revisionDate: response.revisionDate,
    };
  }

  private async createPotentialGranteeViews(
    organizationId: string,
    results: PotentialGranteeResponse[],
  ): Promise<PotentialGranteeView[]> {
    const orgKey = await this.getOrganizationKey(organizationId);
    return await Promise.all(
      results.map(async (r) => {
        const view = new PotentialGranteeView();
        view.id = r.id;
        view.type = r.type;
        view.email = r.email;
        view.currentUser = r.currentUser;
        view.currentUserInGroup = r.currentUserInGroup;

        if (r.type === "serviceAccount" || r.type === "project") {
          view.name = r.name
            ? await this.encryptService.decryptToUtf8(new EncString(r.name), orgKey)
            : null;
        } else {
          view.name = r.name;
        }
        return view;
      }),
    );
  }

  private async createServiceAccountGrantedPoliciesView(
    response: ServiceAccountGrantedPoliciesPermissionDetailsResponse,
    organizationId: string,
  ): Promise<ServiceAccountGrantedPoliciesView> {
    const orgKey = await this.getOrganizationKey(organizationId);

    const view = new ServiceAccountGrantedPoliciesView();
    view.grantedProjectPolicies =
      await this.createServiceAccountProjectPolicyPermissionDetailsViews(
        orgKey,
        response.grantedProjectPolicies,
      );
    return view;
  }

  private async createServiceAccountProjectPolicyPermissionDetailsViews(
    orgKey: SymmetricCryptoKey,
    responses: ServiceAccountProjectPolicyPermissionDetailsResponse[],
  ): Promise<ServiceAccountProjectPolicyPermissionDetailsView[]> {
    return await Promise.all(
      responses.map(async (response) => {
        return await this.createServiceAccountProjectPolicyPermissionDetailsView(orgKey, response);
      }),
    );
  }

  private async createServiceAccountProjectPolicyPermissionDetailsView(
    orgKey: SymmetricCryptoKey,
    response: ServiceAccountProjectPolicyPermissionDetailsResponse,
  ): Promise<ServiceAccountProjectPolicyPermissionDetailsView> {
    const view = new ServiceAccountProjectPolicyPermissionDetailsView();
    view.hasPermission = response.hasPermission;
    view.accessPolicy = await this.createServiceAccountProjectAccessPolicyView(
      orgKey,
      response.accessPolicy,
    );
    return view;
  }

  private createProjectPeopleAccessPoliciesView(
    peopleAccessPoliciesResponse: ProjectPeopleAccessPoliciesResponse,
  ): ProjectPeopleAccessPoliciesView {
    const view = new ProjectPeopleAccessPoliciesView();

    view.userAccessPolicies = peopleAccessPoliciesResponse.userAccessPolicies.map((ap) => {
      return this.createUserProjectAccessPolicyView(ap);
    });
    view.groupAccessPolicies = peopleAccessPoliciesResponse.groupAccessPolicies.map((ap) => {
      return this.createGroupProjectAccessPolicyView(ap);
    });
    return view;
  }

  private createServiceAccountPeopleAccessPoliciesView(
    response: ServiceAccountPeopleAccessPoliciesResponse,
  ): ServiceAccountPeopleAccessPoliciesView {
    const view = new ServiceAccountPeopleAccessPoliciesView();

    view.userAccessPolicies = response.userAccessPolicies.map((ap) => {
      return this.createUserServiceAccountAccessPolicyView(ap);
    });
    view.groupAccessPolicies = response.groupAccessPolicies.map((ap) => {
      return this.createGroupServiceAccountAccessPolicyView(ap);
    });
    return view;
  }

  private createUserProjectAccessPolicyView(
    response: UserProjectAccessPolicyResponse,
  ): UserProjectAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedProjectId: response.grantedProjectId,
      organizationUserId: response.organizationUserId,
      organizationUserName: response.organizationUserName,
      userId: response.userId,
      currentUser: response.currentUser,
    };
  }

  private createGroupProjectAccessPolicyView(
    response: GroupProjectAccessPolicyResponse,
  ): GroupProjectAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedProjectId: response.grantedProjectId,
      groupId: response.groupId,
      groupName: response.groupName,
      currentUserInGroup: response.currentUserInGroup,
    };
  }

  private async createServiceAccountProjectAccessPolicyView(
    organizationKey: SymmetricCryptoKey,
    response: ServiceAccountProjectAccessPolicyResponse,
  ): Promise<ServiceAccountProjectAccessPolicyView> {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedProjectId: response.grantedProjectId,
      serviceAccountId: response.serviceAccountId,
      grantedProjectName: response.grantedProjectName
        ? await this.encryptService.decryptToUtf8(
            new EncString(response.grantedProjectName),
            organizationKey,
          )
        : null,
      serviceAccountName: response.serviceAccountName
        ? await this.encryptService.decryptToUtf8(
            new EncString(response.serviceAccountName),
            organizationKey,
          )
        : null,
    };
  }

  private createUserServiceAccountAccessPolicyView(
    response: UserServiceAccountAccessPolicyResponse,
  ): UserServiceAccountAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedServiceAccountId: response.grantedServiceAccountId,
      organizationUserId: response.organizationUserId,
      organizationUserName: response.organizationUserName,
      userId: response.userId,
      currentUser: response.currentUser,
    };
  }

  private createGroupServiceAccountAccessPolicyView(
    response: GroupServiceAccountAccessPolicyResponse,
  ): GroupServiceAccountAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedServiceAccountId: response.grantedServiceAccountId,
      groupId: response.groupId,
      groupName: response.groupName,
      currentUserInGroup: response.currentUserInGroup,
    };
  }

  private async createProjectServiceAccountsAccessPoliciesView(
    response: ProjectServiceAccountsAccessPoliciesResponse,
    organizationId: string,
  ): Promise<ProjectServiceAccountsAccessPoliciesView> {
    const orgKey = await this.getOrganizationKey(organizationId);

    const view = new ProjectServiceAccountsAccessPoliciesView();
    view.serviceAccountAccessPolicies = await Promise.all(
      response.serviceAccountAccessPolicies.map(async (ap) => {
        return await this.createServiceAccountProjectAccessPolicyView(orgKey, ap);
      }),
    );
    return view;
  }
}
