import { BaseResponse } from "./base.response";

export class SsoPreValidateResponse extends BaseResponse {
  token: string;

  constructor(response: any) {
    super(response);
    this.token = this.getResponseProperty("Token");
  }
}
