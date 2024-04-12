import { Component, Input } from "@angular/core";
import { Observable, combineLatest, map, of, switchMap } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { UserId } from "@bitwarden/common/types/guid";

import { enableAccountSwitching } from "../flags";

@Component({
  selector: "app-header",
  templateUrl: "header.component.html",
})
export class HeaderComponent {
  @Input() noTheme = false;
  @Input() hideAccountSwitcher = false;
  authedAccounts$: Observable<boolean>;
  constructor(accountService: AccountService, authService: AuthService) {
    this.authedAccounts$ = accountService.accounts$.pipe(
      switchMap((accounts) => {
        if (!enableAccountSwitching()) {
          return of(false);
        }

        return combineLatest(
          Object.keys(accounts).map((id) => authService.authStatusFor$(id as UserId)),
        ).pipe(
          map((statuses) => statuses.some((status) => status !== AuthenticationStatus.LoggedOut)),
        );
      }),
    );
  }
}
