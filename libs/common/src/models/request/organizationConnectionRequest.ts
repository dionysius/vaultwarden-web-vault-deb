import { OrganizationConnectionType } from "../../enums/organizationConnectionType";

import { BillingSyncConfigRequest } from "./billingSyncConfigRequest";
import { ScimConfigRequest } from "./scimConfigRequest";

/**API request config types for OrganizationConnectionRequest */
export type OrganizationConnectionRequestConfigs = BillingSyncConfigRequest | ScimConfigRequest;

export class OrganizationConnectionRequest {
  constructor(
    public organizationId: string,
    public type: OrganizationConnectionType,
    public enabled: boolean,
    public config: OrganizationConnectionRequestConfigs
  ) {}
}
