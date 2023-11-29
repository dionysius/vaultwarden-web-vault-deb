import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { map } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "app-current-account",
  templateUrl: "current-account.component.html",
})
export class CurrentAccountComponent {
  constructor(
    private accountService: AccountService,
    private router: Router,
  ) {}

  get currentAccount$() {
    return this.accountService.activeAccount$;
  }

  get currentAccountName$() {
    return this.currentAccount$.pipe(
      map((a) => {
        return Utils.isNullOrWhitespace(a.name) ? a.email : a.name;
      }),
    );
  }

  async currentAccountClicked() {
    await this.router.navigate(["/account-switcher"]);
  }
}
