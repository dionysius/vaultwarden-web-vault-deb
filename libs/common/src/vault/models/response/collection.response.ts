import { SelectionReadOnlyResponse } from "../../../admin-console/models/response/selection-read-only.response";
import { BaseResponse } from "../../../models/response/base.response";

export class CollectionResponse extends BaseResponse {
  id: string;
  organizationId: string;
  name: string;
  externalId: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.organizationId = this.getResponseProperty("OrganizationId");
    this.name = this.getResponseProperty("Name");
    this.externalId = this.getResponseProperty("ExternalId");
  }
}

export class CollectionDetailsResponse extends CollectionResponse {
  readOnly: boolean;
  manage: boolean;
  hidePasswords: boolean;

  constructor(response: any) {
    super(response);
    this.readOnly = this.getResponseProperty("ReadOnly") || false;
    this.manage = this.getResponseProperty("Manage") || false;
    this.hidePasswords = this.getResponseProperty("HidePasswords") || false;
  }
}

export class CollectionAccessDetailsResponse extends CollectionResponse {
  groups: SelectionReadOnlyResponse[] = [];
  users: SelectionReadOnlyResponse[] = [];

  /**
   * Flag indicating the user has been explicitly assigned to this Collection
   */
  assigned: boolean;

  constructor(response: any) {
    super(response);
    this.assigned = this.getResponseProperty("Assigned") || false;

    const groups = this.getResponseProperty("Groups");
    if (groups != null) {
      this.groups = groups.map((g: any) => new SelectionReadOnlyResponse(g));
    }

    const users = this.getResponseProperty("Users");
    if (users != null) {
      this.users = users.map((g: any) => new SelectionReadOnlyResponse(g));
    }
  }
}
