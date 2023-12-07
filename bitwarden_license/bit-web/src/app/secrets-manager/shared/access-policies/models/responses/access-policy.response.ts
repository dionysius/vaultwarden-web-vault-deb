import { BaseResponse } from "@bitwarden/common/models/response/base.response";

export class BaseAccessPolicyResponse extends BaseResponse {
  id: string;
  read: boolean;
  write: boolean;
  creationDate: string;
  revisionDate: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.read = this.getResponseProperty("Read");
    this.write = this.getResponseProperty("Write");
    this.creationDate = this.getResponseProperty("CreationDate");
    this.revisionDate = this.getResponseProperty("RevisionDate");
  }
}

export class UserProjectAccessPolicyResponse extends BaseAccessPolicyResponse {
  organizationUserId: string;
  organizationUserName: string;
  grantedProjectId: string;
  userId: string;
  currentUser: boolean;

  constructor(response: any) {
    super(response);
    this.organizationUserId = this.getResponseProperty("OrganizationUserId");
    this.organizationUserName = this.getResponseProperty("OrganizationUserName");
    this.grantedProjectId = this.getResponseProperty("GrantedProjectId");
    this.userId = this.getResponseProperty("UserId");
    this.currentUser = this.getResponseProperty("CurrentUser");
  }
}

export class UserServiceAccountAccessPolicyResponse extends BaseAccessPolicyResponse {
  organizationUserId: string;
  organizationUserName: string;
  grantedServiceAccountId: string;
  userId: string;
  currentUser: boolean;

  constructor(response: any) {
    super(response);
    this.organizationUserId = this.getResponseProperty("OrganizationUserId");
    this.organizationUserName = this.getResponseProperty("OrganizationUserName");
    this.grantedServiceAccountId = this.getResponseProperty("GrantedServiceAccountId");
    this.userId = this.getResponseProperty("UserId");
    this.currentUser = this.getResponseProperty("CurrentUser");
  }
}

export class GroupProjectAccessPolicyResponse extends BaseAccessPolicyResponse {
  groupId: string;
  groupName: string;
  grantedProjectId: string;
  currentUserInGroup: boolean;

  constructor(response: any) {
    super(response);
    this.groupId = this.getResponseProperty("GroupId");
    this.groupName = this.getResponseProperty("GroupName");
    this.grantedProjectId = this.getResponseProperty("GrantedProjectId");
    this.currentUserInGroup = this.getResponseProperty("CurrentUserInGroup");
  }
}

export class GroupServiceAccountAccessPolicyResponse extends BaseAccessPolicyResponse {
  groupId: string;
  groupName: string;
  grantedServiceAccountId: string;
  currentUserInGroup: boolean;

  constructor(response: any) {
    super(response);
    this.groupId = this.getResponseProperty("GroupId");
    this.groupName = this.getResponseProperty("GroupName");
    this.grantedServiceAccountId = this.getResponseProperty("GrantedServiceAccountId");
    this.currentUserInGroup = this.getResponseProperty("CurrentUserInGroup");
  }
}

export class ServiceAccountProjectAccessPolicyResponse extends BaseAccessPolicyResponse {
  serviceAccountId: string;
  serviceAccountName: string;
  grantedProjectId: string;
  grantedProjectName: string;

  constructor(response: any) {
    super(response);
    this.serviceAccountId = this.getResponseProperty("ServiceAccountId");
    this.serviceAccountName = this.getResponseProperty("ServiceAccountName");
    this.grantedProjectId = this.getResponseProperty("GrantedProjectId");
    this.grantedProjectName = this.getResponseProperty("GrantedProjectName");
  }
}
