import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import { WebauthnLoginCredentialPrfStatus } from "../../../enums/webauthn-login-credential-prf-status.enum";

/**
 * A webauthn login credential received from the server.
 */
export class WebauthnLoginCredentialResponse extends BaseResponse {
  id: string;
  name: string;
  prfStatus: WebauthnLoginCredentialPrfStatus;

  constructor(response: unknown) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.name = this.getResponseProperty("Name");
    this.prfStatus = this.getResponseProperty("PrfStatus");
  }
}
