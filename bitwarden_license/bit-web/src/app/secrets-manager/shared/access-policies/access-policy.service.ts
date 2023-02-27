import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { ListResponse } from "@bitwarden/common/models/response/list.response";

import {
  BaseAccessPolicyView,
  GroupProjectAccessPolicyView,
  GroupServiceAccountAccessPolicyView,
  ProjectAccessPoliciesView,
  ServiceAccountAccessPoliciesView,
  ServiceAccountProjectAccessPolicyView,
  UserProjectAccessPolicyView,
  UserServiceAccountAccessPolicyView,
} from "../../models/view/access-policy.view";
import { PotentialGranteeView } from "../../models/view/potential-grantee.view";
import { AccessPoliciesCreateRequest } from "../../shared/access-policies/models/requests/access-policies-create.request";
import { ProjectAccessPoliciesResponse } from "../../shared/access-policies/models/responses/project-access-policies.response";
import { ServiceAccountAccessPoliciesResponse } from "../../shared/access-policies/models/responses/service-accounts-access-policies.response";

import { AccessPolicyUpdateRequest } from "./models/requests/access-policy-update.request";
import { AccessPolicyRequest } from "./models/requests/access-policy.request";
import {
  GroupServiceAccountAccessPolicyResponse,
  UserServiceAccountAccessPolicyResponse,
  GroupProjectAccessPolicyResponse,
  ServiceAccountProjectAccessPolicyResponse,
  UserProjectAccessPolicyResponse,
} from "./models/responses/access-policy.response";
import { PotentialGranteeResponse } from "./models/responses/potential-grantee.response";

@Injectable({
  providedIn: "root",
})
export class AccessPolicyService {
  private _projectAccessPolicyChanges$ = new Subject<ProjectAccessPoliciesView>();
  private _serviceAccountAccessPolicyChanges$ = new Subject<ServiceAccountAccessPoliciesView>();

  /**
   * Emits when a project access policy is created or deleted.
   */
  readonly projectAccessPolicyChanges$ = this._projectAccessPolicyChanges$.asObservable();

  /**
   * Emits when a service account access policy is created or deleted.
   */
  readonly serviceAccountAccessPolicyChanges$ =
    this._serviceAccountAccessPolicyChanges$.asObservable();

  constructor(
    private cryptoService: CryptoService,
    protected apiService: ApiService,
    protected encryptService: EncryptService
  ) {}

  async getProjectAccessPolicies(
    organizationId: string,
    projectId: string
  ): Promise<ProjectAccessPoliciesView> {
    const r = await this.apiService.send(
      "GET",
      "/projects/" + projectId + "/access-policies",
      null,
      true,
      true
    );

    const results = new ProjectAccessPoliciesResponse(r);
    return await this.createProjectAccessPoliciesView(organizationId, results);
  }

  async getServiceAccountAccessPolicies(
    serviceAccountId: string
  ): Promise<ServiceAccountAccessPoliciesView> {
    const r = await this.apiService.send(
      "GET",
      "/service-accounts/" + serviceAccountId + "/access-policies",
      null,
      true,
      true
    );

    const results = new ServiceAccountAccessPoliciesResponse(r);
    return await this.createServiceAccountAccessPoliciesView(results);
  }

  async createProjectAccessPolicies(
    organizationId: string,
    projectId: string,
    projectAccessPoliciesView: ProjectAccessPoliciesView
  ): Promise<ProjectAccessPoliciesView> {
    const request = this.getAccessPoliciesCreateRequest(projectAccessPoliciesView);
    const r = await this.apiService.send(
      "POST",
      "/projects/" + projectId + "/access-policies",
      request,
      true,
      true
    );
    const results = new ProjectAccessPoliciesResponse(r);
    const view = await this.createProjectAccessPoliciesView(organizationId, results);
    this._projectAccessPolicyChanges$.next(view);
    return view;
  }

  async createServiceAccountAccessPolicies(
    serviceAccountId: string,
    serviceAccountAccessPoliciesView: ServiceAccountAccessPoliciesView
  ): Promise<ServiceAccountAccessPoliciesView> {
    const request = this.getServiceAccountAccessPoliciesCreateRequest(
      serviceAccountAccessPoliciesView
    );
    const r = await this.apiService.send(
      "POST",
      "/service-accounts/" + serviceAccountId + "/access-policies",
      request,
      true,
      true
    );
    const results = new ServiceAccountAccessPoliciesResponse(r);
    const view = await this.createServiceAccountAccessPoliciesView(results);
    this._serviceAccountAccessPolicyChanges$.next(view);
    return view;
  }

  async deleteAccessPolicy(accessPolicyId: string): Promise<void> {
    await this.apiService.send("DELETE", "/access-policies/" + accessPolicyId, null, true, false);
    this._projectAccessPolicyChanges$.next(null);
    this._serviceAccountAccessPolicyChanges$.next(null);
  }

  async updateAccessPolicy(baseAccessPolicyView: BaseAccessPolicyView): Promise<void> {
    const payload = new AccessPolicyUpdateRequest();
    payload.read = baseAccessPolicyView.read;
    payload.write = baseAccessPolicyView.write;
    await this.apiService.send(
      "PUT",
      "/access-policies/" + baseAccessPolicyView.id,
      payload,
      true,
      true
    );
  }

  private async createProjectAccessPoliciesView(
    organizationId: string,
    projectAccessPoliciesResponse: ProjectAccessPoliciesResponse
  ): Promise<ProjectAccessPoliciesView> {
    const orgKey = await this.getOrganizationKey(organizationId);
    const view = new ProjectAccessPoliciesView();

    view.userAccessPolicies = projectAccessPoliciesResponse.userAccessPolicies.map((ap) => {
      return this.createUserProjectAccessPolicyView(ap);
    });
    view.groupAccessPolicies = projectAccessPoliciesResponse.groupAccessPolicies.map((ap) => {
      return this.createGroupProjectAccessPolicyView(ap);
    });
    view.serviceAccountAccessPolicies = await Promise.all(
      projectAccessPoliciesResponse.serviceAccountAccessPolicies.map(async (ap) => {
        return await this.createServiceAccountProjectAccessPolicyView(orgKey, ap);
      })
    );
    return view;
  }

  private getAccessPoliciesCreateRequest(
    projectAccessPoliciesView: ProjectAccessPoliciesView
  ): AccessPoliciesCreateRequest {
    const createRequest = new AccessPoliciesCreateRequest();

    if (projectAccessPoliciesView.userAccessPolicies?.length > 0) {
      createRequest.userAccessPolicyRequests = projectAccessPoliciesView.userAccessPolicies.map(
        (ap) => {
          return this.getAccessPolicyRequest(ap.organizationUserId, ap);
        }
      );
    }

    if (projectAccessPoliciesView.groupAccessPolicies?.length > 0) {
      createRequest.groupAccessPolicyRequests = projectAccessPoliciesView.groupAccessPolicies.map(
        (ap) => {
          return this.getAccessPolicyRequest(ap.groupId, ap);
        }
      );
    }

    if (projectAccessPoliciesView.serviceAccountAccessPolicies?.length > 0) {
      createRequest.serviceAccountAccessPolicyRequests =
        projectAccessPoliciesView.serviceAccountAccessPolicies.map((ap) => {
          return this.getAccessPolicyRequest(ap.serviceAccountId, ap);
        });
    }
    return createRequest;
  }

  private createUserProjectAccessPolicyView(
    response: UserProjectAccessPolicyResponse
  ): UserProjectAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedProjectId: response.grantedProjectId,
      organizationUserId: response.organizationUserId,
      organizationUserName: response.organizationUserName,
    };
  }

  private createGroupProjectAccessPolicyView(
    response: GroupProjectAccessPolicyResponse
  ): GroupProjectAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedProjectId: response.grantedProjectId,
      groupId: response.groupId,
      groupName: response.groupName,
    };
  }

  private async createServiceAccountProjectAccessPolicyView(
    organizationKey: SymmetricCryptoKey,
    response: ServiceAccountProjectAccessPolicyResponse
  ): Promise<ServiceAccountProjectAccessPolicyView> {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedProjectId: response.grantedProjectId,
      serviceAccountId: response.serviceAccountId,
      serviceAccountName: await this.encryptService.decryptToUtf8(
        new EncString(response.serviceAccountName),
        organizationKey
      ),
    };
  }

  private getServiceAccountAccessPoliciesCreateRequest(
    serviceAccountAccessPoliciesView: ServiceAccountAccessPoliciesView
  ): AccessPoliciesCreateRequest {
    const createRequest = new AccessPoliciesCreateRequest();

    if (serviceAccountAccessPoliciesView.userAccessPolicies?.length > 0) {
      createRequest.userAccessPolicyRequests =
        serviceAccountAccessPoliciesView.userAccessPolicies.map((ap) => {
          return this.getAccessPolicyRequest(ap.organizationUserId, ap);
        });
    }

    if (serviceAccountAccessPoliciesView.groupAccessPolicies?.length > 0) {
      createRequest.groupAccessPolicyRequests =
        serviceAccountAccessPoliciesView.groupAccessPolicies.map((ap) => {
          return this.getAccessPolicyRequest(ap.groupId, ap);
        });
    }

    return createRequest;
  }

  private async createServiceAccountAccessPoliciesView(
    serviceAccountAccessPoliciesResponse: ServiceAccountAccessPoliciesResponse
  ): Promise<ServiceAccountAccessPoliciesView> {
    const view = new ServiceAccountAccessPoliciesView();
    view.userAccessPolicies = serviceAccountAccessPoliciesResponse.userAccessPolicies.map((ap) => {
      return this.createUserServiceAccountAccessPolicyView(ap);
    });
    view.groupAccessPolicies = serviceAccountAccessPoliciesResponse.groupAccessPolicies.map(
      (ap) => {
        return this.createGroupServiceAccountAccessPolicyView(ap);
      }
    );
    return view;
  }

  private createUserServiceAccountAccessPolicyView(
    response: UserServiceAccountAccessPolicyResponse
  ): UserServiceAccountAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedServiceAccountId: response.grantedServiceAccountId,
      organizationUserId: response.organizationUserId,
      organizationUserName: response.organizationUserName,
    };
  }

  private createGroupServiceAccountAccessPolicyView(
    response: GroupServiceAccountAccessPolicyResponse
  ): GroupServiceAccountAccessPolicyView {
    return {
      ...this.createBaseAccessPolicyView(response),
      grantedServiceAccountId: response.grantedServiceAccountId,
      groupId: response.groupId,
      groupName: response.groupName,
    };
  }

  async getPeoplePotentialGrantees(organizationId: string) {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/access-policies/people/potential-grantees",
      null,
      true,
      true
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
      true
    );
    const results = new ListResponse(r, PotentialGranteeResponse);
    return await this.createPotentialGranteeViews(organizationId, results.data);
  }

  protected async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  protected getAccessPolicyRequest(
    granteeId: string,
    view:
      | UserProjectAccessPolicyView
      | UserServiceAccountAccessPolicyView
      | GroupProjectAccessPolicyView
      | GroupServiceAccountAccessPolicyView
      | ServiceAccountProjectAccessPolicyView
  ) {
    const request = new AccessPolicyRequest();
    request.granteeId = granteeId;
    request.read = view.read;
    request.write = view.write;
    return request;
  }

  protected createBaseAccessPolicyView(
    response:
      | UserProjectAccessPolicyResponse
      | UserServiceAccountAccessPolicyResponse
      | GroupProjectAccessPolicyResponse
      | GroupServiceAccountAccessPolicyResponse
      | ServiceAccountProjectAccessPolicyResponse
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
    results: PotentialGranteeResponse[]
  ): Promise<PotentialGranteeView[]> {
    const orgKey = await this.getOrganizationKey(organizationId);
    return await Promise.all(
      results.map(async (r) => {
        const view = new PotentialGranteeView();
        view.id = r.id;
        view.type = r.type;
        view.email = r.email;

        if (r.type === "serviceAccount") {
          view.name = await this.encryptService.decryptToUtf8(new EncString(r.name), orgKey);
        } else {
          view.name = r.name;
        }
        return view;
      })
    );
  }
}
