import { UriMatchType } from "../../enums/uriMatchType";
import { LoginUri as LoginUriDomain } from "../../vault/models/domain/login-uri";
import { LoginUriView } from "../../vault/models/view/login-uri.view";
import { EncString } from "../domain/enc-string";

export class LoginUriExport {
  static template(): LoginUriExport {
    const req = new LoginUriExport();
    req.uri = "https://google.com";
    req.match = null;
    return req;
  }

  static toView(req: LoginUriExport, view = new LoginUriView()) {
    view.uri = req.uri;
    view.match = req.match;
    return view;
  }

  static toDomain(req: LoginUriExport, domain = new LoginUriDomain()) {
    domain.uri = req.uri != null ? new EncString(req.uri) : null;
    domain.match = req.match;
    return domain;
  }

  uri: string;
  match: UriMatchType = null;

  constructor(o?: LoginUriView | LoginUriDomain) {
    if (o == null) {
      return;
    }

    if (o instanceof LoginUriView) {
      this.uri = o.uri;
    } else {
      this.uri = o.uri?.encryptedString;
    }
    this.match = o.match;
  }
}
