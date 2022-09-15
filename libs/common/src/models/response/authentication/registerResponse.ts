import { BaseResponse } from "../baseResponse";

import { ICaptchaProtectedResponse } from "./ICaptchaProtectedResponse";

export class RegisterResponse extends BaseResponse implements ICaptchaProtectedResponse {
  captchaBypassToken: string;

  constructor(response: any) {
    super(response);
    this.captchaBypassToken = this.getResponseProperty("CaptchaBypassToken");
  }
}
