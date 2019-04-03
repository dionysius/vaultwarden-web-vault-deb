// FIXME: Update this file to be type safe and remove this and next line
// @ts-strict-ignore
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Observable, of } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { SyncService } from "@bitwarden/common/platform/sync";
import { IconModule } from "@bitwarden/components";

import { BillingFreeFamiliesNavItemComponent } from "../billing/shared/billing-free-families-nav-item.component";

import { PasswordManagerLogo } from "./password-manager-logo";
import { WebLayoutModule } from "./web-layout.module";

@Component({
  selector: "app-user-layout",
  templateUrl: "user-layout.component.html",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    JslibModule,
    WebLayoutModule,
    IconModule,
    BillingFreeFamiliesNavItemComponent,
  ],
})
export class UserLayoutComponent implements OnInit {
  protected readonly logo = PasswordManagerLogo;
  protected hasFamilySponsorshipAvailable$: Observable<boolean>;
  protected showSponsoredFamilies$: Observable<boolean>;
  protected showSubscription$: Observable<boolean>;

  constructor(
    private syncService: SyncService,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private accountService: AccountService,
  ) {
    this.showSubscription$ = of(false); // always hide subscriptions in Vaultwarden
  }

  async ngOnInit() {
    document.body.classList.remove("layout_frontend");
    await this.syncService.fullSync(false);

    this.hasFamilySponsorshipAvailable$ = of(false); // disable family Sponsorships in Vaultwarden
    this.showSponsoredFamilies$ = of(false); // disable family Sponsorships in Vaultwarden
  }
}
