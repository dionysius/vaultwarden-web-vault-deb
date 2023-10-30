import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";

@Component({
  selector: "app-current-account",
  templateUrl: "current-account.component.html",
})
export class CurrentAccountComponent {
  constructor(private accountService: AccountService, private router: Router) {}

  get currentAccount$() {
    return this.accountService.activeAccount$;
  }

  currentAccountClicked() {
    this.router.navigate(["/account-switcher"]);
  }
}
