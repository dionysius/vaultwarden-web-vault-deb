import { OrganizationConnectionType } from "../../enums/organizationConnectionType";
import { BillingSyncConfigApi } from "../api/billing-sync-config.api";
import { ScimConfigApi } from "../api/scim-config.api";

import { BaseResponse } from "./base.response";

/**API response config types for OrganizationConnectionResponse */
export type OrganizationConnectionConfigApis = BillingSyncConfigApi | ScimConfigApi;

export class OrganizationConnectionResponse<
  TConfig extends OrganizationConnectionConfigApis
> extends BaseResponse {
  id: string;
  type: OrganizationConnectionType;
  organizationId: string;
  enabled: boolean;
  config: TConfig;

  constructor(response: any, configType: { new (response: any): TConfig }) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.type = this.getResponseProperty("Type");
    this.organizationId = this.getResponseProperty("OrganizationId");
    this.enabled = this.getResponseProperty("Enabled");
    const rawConfig = this.getResponseProperty("Config");
    this.config = rawConfig == null ? null : new configType(rawConfig);
  }
}
