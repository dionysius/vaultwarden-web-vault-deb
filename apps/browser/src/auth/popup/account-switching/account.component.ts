import { CommonModule, Location } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { AvatarModule } from "@bitwarden/components";

import { AccountSwitcherService, AvailableAccount } from "./services/account-switcher.service";

@Component({
  standalone: true,
  selector: "auth-account",
  templateUrl: "account.component.html",
  imports: [CommonModule, JslibModule, AvatarModule],
})
export class AccountComponent {
  @Input() account: AvailableAccount;
  @Output() loading = new EventEmitter<boolean>();

  constructor(
    private accountSwitcherService: AccountSwitcherService,
    private router: Router,
    private location: Location,
    private i18nService: I18nService,
  ) {}

  get specialAccountAddId() {
    return this.accountSwitcherService.SPECIAL_ADD_ACCOUNT_ID;
  }

  async selectAccount(id: string) {
    this.loading.emit(true);
    await this.accountSwitcherService.selectAccount(id);

    if (id === this.specialAccountAddId) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["home"]);
    } else {
      this.location.back();
    }
  }

  get status() {
    if (this.account.isActive) {
      return { text: this.i18nService.t("active"), icon: "bwi-check-circle" };
    }

    if (this.account.status === AuthenticationStatus.Unlocked) {
      return { text: this.i18nService.t("unlocked"), icon: "bwi-unlock" };
    }

    return { text: this.i18nService.t("locked"), icon: "bwi-lock" };
  }
}
