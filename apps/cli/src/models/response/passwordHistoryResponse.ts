import { PasswordHistoryView } from "@bitwarden/common/models/view/password-history.view";

export class PasswordHistoryResponse {
  lastUsedDate: Date;
  password: string;

  constructor(o: PasswordHistoryView) {
    this.lastUsedDate = o.lastUsedDate;
    this.password = o.password;
  }
}
