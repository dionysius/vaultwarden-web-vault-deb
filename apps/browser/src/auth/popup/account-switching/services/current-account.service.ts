import { Injectable } from "@angular/core";
import { Observable, switchMap } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { UserId } from "@bitwarden/common/types/guid";

export type CurrentAccount = {
  id: UserId;
  name: string | undefined;
  email: string;
  status: AuthenticationStatus;
  avatarColor: string;
};

@Injectable({
  providedIn: "root",
})
export class CurrentAccountService {
  currentAccount$: Observable<CurrentAccount>;

  constructor(
    private accountService: AccountService,
    private stateService: StateService,
  ) {
    this.currentAccount$ = this.accountService.activeAccount$.pipe(
      switchMap(async (account) => {
        if (account == null) {
          return null;
        }
        const currentAccount: CurrentAccount = {
          id: account.id,
          name: account.name || account.email,
          email: account.email,
          status: account.status,
          avatarColor: await this.stateService.getAvatarColor({ userId: account.id }),
        };

        return currentAccount;
      }),
    );
  }
}
