import { BaseResponse } from "../../../models/response/base.response";

export class OrganizationBillingMetadataResponse extends BaseResponse {
  isOnSecretsManagerStandalone: boolean;

  constructor(response: any) {
    super(response);
    this.isOnSecretsManagerStandalone = this.getResponseProperty("IsOnSecretsManagerStandalone");
  }
}
