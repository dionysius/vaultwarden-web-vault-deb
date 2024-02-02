import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { BroadcasterService } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { StateService } from "../core";

const BroadcasterSubscriptionId = "SettingsComponent";

@Component({
  selector: "app-settings",
  templateUrl: "settings.component.html",
})
export class SettingsComponent implements OnInit, OnDestroy {
  premium: boolean;
  selfHosted: boolean;
  hasFamilySponsorshipAvailable: boolean;
  hideSubscription: boolean;

  constructor(
    private tokenService: TokenService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    private platformUtilsService: PlatformUtilsService,
    private organizationService: OrganizationService,
    private stateService: StateService,
    private apiService: ApiService,
  ) {}

  async ngOnInit() {
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.ngZone.run(async () => {
        switch (message.command) {
          case "purchasedPremium":
            await this.load();
            break;
          default:
        }
      });
    });

    this.selfHosted = await this.platformUtilsService.isSelfHost();
    await this.load();
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async load() {
    this.premium = await this.stateService.getHasPremiumPersonally();
    this.hasFamilySponsorshipAvailable = await this.organizationService.canManageSponsorships();
    const hasPremiumFromOrg = await this.stateService.getHasPremiumFromOrganization();
    let billing = null;
    if (!this.selfHosted) {
      billing = await this.apiService.getUserBillingHistory();
    }
    this.hideSubscription =
      !this.premium && hasPremiumFromOrg && (this.selfHosted || billing?.hasNoHistory);
  }
}
