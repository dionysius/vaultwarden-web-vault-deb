import { SsoConfigApi } from "../../api/sso-config.api";
import { BaseResponse } from "../base.response";

export class OrganizationSsoResponse extends BaseResponse {
  enabled: boolean;
  identifier: string;
  data: SsoConfigApi;
  urls: SsoUrls;

  constructor(response: any) {
    super(response);
    this.enabled = this.getResponseProperty("Enabled");
    this.identifier = this.getResponseProperty("Identifier");
    this.data =
      this.getResponseProperty("Data") != null
        ? new SsoConfigApi(this.getResponseProperty("Data"))
        : null;
    this.urls = new SsoUrls(this.getResponseProperty("Urls"));
  }
}

class SsoUrls extends BaseResponse {
  callbackPath: string;
  signedOutCallbackPath: string;
  spEntityId: string;
  spMetadataUrl: string;
  spAcsUrl: string;

  constructor(response: any) {
    super(response);
    this.callbackPath = this.getResponseProperty("CallbackPath");
    this.signedOutCallbackPath = this.getResponseProperty("SignedOutCallbackPath");
    this.spEntityId = this.getResponseProperty("SpEntityId");
    this.spMetadataUrl = this.getResponseProperty("SpMetadataUrl");
    this.spAcsUrl = this.getResponseProperty("SpAcsUrl");
  }
}
