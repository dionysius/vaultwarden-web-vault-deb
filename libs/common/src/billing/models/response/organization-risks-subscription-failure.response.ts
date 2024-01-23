import { BaseResponse } from "../../../models/response/base.response";

export class OrganizationRisksSubscriptionFailureResponse extends BaseResponse {
  organizationId: string;
  risksSubscriptionFailure: boolean;

  constructor(response: any) {
    super(response);

    this.organizationId = this.getResponseProperty("OrganizationId");
    this.risksSubscriptionFailure = this.getResponseProperty("RisksSubscriptionFailure");
  }
}
