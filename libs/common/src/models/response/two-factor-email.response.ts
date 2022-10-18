import { BaseResponse } from "./base.response";

export class TwoFactorEmailResponse extends BaseResponse {
  enabled: boolean;
  email: string;

  constructor(response: any) {
    super(response);
    this.enabled = this.getResponseProperty("Enabled");
    this.email = this.getResponseProperty("Email");
  }
}
