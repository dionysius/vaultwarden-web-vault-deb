import { OrganizationApiKeyType } from "../../enums/organizationApiKeyType";

import { BaseResponse } from "./base.response";

export class OrganizationApiKeyInformationResponse extends BaseResponse {
  keyType: OrganizationApiKeyType;

  constructor(response: any) {
    super(response);
    this.keyType = this.getResponseProperty("KeyType");
  }
}
