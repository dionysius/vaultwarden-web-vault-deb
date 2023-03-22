import { BaseResponse } from "../../../models/response/base.response";
import { ScimProviderType } from "../../enums/scim-provider-type";

export class ScimConfigApi extends BaseResponse {
  enabled: boolean;
  scimProvider: ScimProviderType;

  constructor(data: any) {
    super(data);
    if (data == null) {
      return;
    }
    this.enabled = this.getResponseProperty("Enabled");
    this.scimProvider = this.getResponseProperty("ScimProvider");
  }
}
