import { UriMatchType } from "../../enums";
import { LoginUriApi } from "../api/login-uri.api";

export class LoginUriData {
  uri: string;
  uriChecksum: string;
  match: UriMatchType = null;

  constructor(data?: LoginUriApi) {
    if (data == null) {
      return;
    }
    this.uri = data.uri;
    this.uriChecksum = data.uriChecksum;
    this.match = data.match;
  }
}
