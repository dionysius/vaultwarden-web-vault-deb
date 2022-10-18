import { BaseResponse } from "./base.response";

export class KeysResponse extends BaseResponse {
  privateKey: string;
  publicKey: string;

  constructor(response: any) {
    super(response);
    this.privateKey = this.getResponseProperty("PrivateKey");
    this.publicKey = this.getResponseProperty("PublicKey");
  }
}
