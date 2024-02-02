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
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["/account-switcher"]);
    }
  }
}
