import { BaseResponse } from "./base.response";

export class OrganizationUserBulkResponse extends BaseResponse {
  id: string;
  error: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.error = this.getResponseProperty("Error");
  }
}
