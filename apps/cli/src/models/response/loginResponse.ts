import { LoginExport } from "@bitwarden/common/models/export/login.export";
import { LoginView } from "@bitwarden/common/models/view/login.view";

export class LoginResponse extends LoginExport {
  passwordRevisionDate: Date;

  constructor(o: LoginView) {
    super(o);
    this.passwordRevisionDate = o.passwordRevisionDate != null ? o.passwordRevisionDate : null;
  }
}
