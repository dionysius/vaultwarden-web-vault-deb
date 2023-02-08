import { OrganizationKeysRequest } from "./organization-keys.request";

export class OrganizationUpdateRequest {
  name: string;
  businessName: string;
  billingEmail: string;
  keys: OrganizationKeysRequest;
}
