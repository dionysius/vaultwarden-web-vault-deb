import { Component } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-org-billing-tab",
  templateUrl: "organization-billing-tab.component.html",
})
export class OrganizationBillingTabComponent {
  showPaymentAndHistory: boolean;
  constructor(private platformUtilsService: PlatformUtilsService) {
    this.showPaymentAndHistory = !this.platformUtilsService.isSelfHost();
  }
}
