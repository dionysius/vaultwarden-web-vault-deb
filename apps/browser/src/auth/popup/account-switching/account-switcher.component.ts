import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AccountSwitcherService } from "../services/account-switcher.service";

@Component({
  templateUrl: "account-switcher.component.html",
})
export class AccountSwitcherComponent {
  constructor(private accountSwitcherService: AccountSwitcherService, private router: Router) {}

  get accountOptions$() {
    return this.accountSwitcherService.accountOptions$;
  }

  async selectAccount(id: string) {
    await this.accountSwitcherService.selectAccount(id);
    this.router.navigate(["/home"]);
  }
}
