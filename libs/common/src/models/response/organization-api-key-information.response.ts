import { OrganizationApiKeyType } from "../../auth/enums/organization-api-key-type";

import { BaseResponse } from "./base.response";

export class OrganizationApiKeyInformationResponse extends BaseResponse {
  keyType: OrganizationApiKeyType;

  constructor(response: any) {
    super(response);
    this.keyType = this.getResponseProperty("KeyType");
  }
}
