import { OrganizationConnectionType } from "../../enums/organizationConnectionType";
import { BillingSyncConfigApi } from "../api/billingSyncConfigApi";
import { ScimConfigApi } from "../api/scimConfigApi";

import { BaseResponse } from "./baseResponse";

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
