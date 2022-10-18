import { BaseResponse } from "./base.response";

export class KeyConnectorUserKeyResponse extends BaseResponse {
  key: string;

  constructor(response: any) {
    super(response);
    this.key = this.getResponseProperty("Key");
  }
}
