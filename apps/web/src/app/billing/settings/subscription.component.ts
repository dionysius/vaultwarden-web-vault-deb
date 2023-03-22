import { Component } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

@Component({
  selector: "app-subscription",
  templateUrl: "subscription.component.html",
})
export class SubscriptionComponent {
  hasPremium: boolean;
  selfHosted: boolean;

  constructor(
    private stateService: StateService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  async ngOnInit() {
    this.hasPremium = await this.stateService.getHasPremiumPersonally();
    this.selfHosted = this.platformUtilsService.isSelfHost();
  }

  get subscriptionRoute(): string {
    return this.hasPremium ? "user-subscription" : "premium";
  }
}
