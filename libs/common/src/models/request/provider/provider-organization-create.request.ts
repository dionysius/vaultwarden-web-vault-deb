import { OrganizationCreateRequest } from "../organization-create.request";

export class ProviderOrganizationCreateRequest {
  constructor(
    public clientOwnerEmail: string,
    public organizationCreateRequest: OrganizationCreateRequest
  ) {}
}
