import { Component, Input } from "@angular/core";
import { Observable, map } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

import { enableAccountSwitching } from "../flags";

@Component({
  selector: "app-header",
  templateUrl: "header.component.html",
})
export class HeaderComponent {
  @Input() noTheme = false;
  @Input() hideAccountSwitcher = false;
  authedAccounts$: Observable<boolean>;
  constructor(accountService: AccountService) {
    this.authedAccounts$ = accountService.accounts$.pipe(
      map((accounts) => {
        if (!enableAccountSwitching()) {
          return false;
        }

        return Object.values(accounts).some((a) => a.status !== AuthenticationStatus.LoggedOut);
      }),
    );
  }
}
