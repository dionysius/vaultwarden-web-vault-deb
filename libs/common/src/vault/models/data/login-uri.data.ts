import { UriMatchType } from "../../../enums/uriMatchType";
import { LoginUriApi } from "../../../models/api/login-uri.api";

export class LoginUriData {
  uri: string;
  match: UriMatchType = null;

  constructor(data?: LoginUriApi) {
    if (data == null) {
      return;
    }
    this.uri = data.uri;
    this.match = data.match;
  }
}
