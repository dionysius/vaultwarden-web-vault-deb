import { Location } from "@angular/common";
import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { CurrentAccountService } from "./services/current-account.service";

@Component({
  selector: "app-current-account",
  templateUrl: "current-account.component.html",
})
export class CurrentAccountComponent {
  constructor(
    private currentAccountService: CurrentAccountService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
  ) {}

  get currentAccount$() {
    return this.currentAccountService.currentAccount$;
  }

  async currentAccountClicked() {
    if (this.route.snapshot.data.state.includes("account-switcher")) {
      this.location.back();
    } else {
      this.router.navigate(["/account-switcher"]);
    }
  }
}
