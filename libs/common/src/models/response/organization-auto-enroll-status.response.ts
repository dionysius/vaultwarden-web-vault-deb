import { BaseResponse } from "./base.response";

export class OrganizationAutoEnrollStatusResponse extends BaseResponse {
  id: string;
  resetPasswordEnabled: boolean;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.resetPasswordEnabled = this.getResponseProperty("ResetPasswordEnabled");
  }
}
