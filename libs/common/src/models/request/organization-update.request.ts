import { OrganizationKeysRequest } from "./organization-keys.request";

export class OrganizationUpdateRequest {
  name: string;
  /**
   * @deprecated 2022-08-03 Moved to OrganizationSsoRequest, left for backwards compatability.
   * https://bitwarden.atlassian.net/browse/EC-489
   */
  identifier: string;
  businessName: string;
  billingEmail: string;
  keys: OrganizationKeysRequest;
}
