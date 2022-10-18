import { BaseResponse } from "../base.response";

import { ICaptchaProtectedResponse } from "./captcha-protected.response";

export class RegisterResponse extends BaseResponse implements ICaptchaProtectedResponse {
  captchaBypassToken: string;

  constructor(response: any) {
    super(response);
    this.captchaBypassToken = this.getResponseProperty("CaptchaBypassToken");
  }
}
