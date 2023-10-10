import { BaseResponse } from "@bitwarden/common/models/response/base.response";

/**
 * A webauthn login credential recieved from the server.
 */
export class WebauthnLoginCredentialResponse extends BaseResponse {
  id: string;
  name: string;
  prfSupport: boolean;

  constructor(response: unknown) {
    super(response);
    this.id = this.getResponseProperty("id");
    this.name = this.getResponseProperty("name");
    this.prfSupport = this.getResponseProperty("prfSupport");
  }
}
