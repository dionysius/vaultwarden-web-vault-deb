import { ScimProviderType } from "../../enums/scimProviderType";
import { BaseResponse } from "../response/base.response";

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
