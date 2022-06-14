import { LoginExport } from "@bitwarden/common/models/export/loginExport";
import { LoginView } from "@bitwarden/common/models/view/loginView";

export class LoginResponse extends LoginExport {
  passwordRevisionDate: Date;

  constructor(o: LoginView) {
    super(o);
    this.passwordRevisionDate = o.passwordRevisionDate != null ? o.passwordRevisionDate : null;
  }
}
