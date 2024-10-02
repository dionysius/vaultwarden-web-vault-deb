import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterModule } from "@angular/router";
import { filter, map, switchMap } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { SendService } from "@bitwarden/common/tools/send/services/send.service.abstraction";
import { LinkModule } from "@bitwarden/components";

const allNavButtons = [
  {
    label: "Vault",
    page: "/tabs/vault",
    iconKey: "lock",
    iconKeyActive: "lock-f",
  },
  {
    label: "Generator",
    page: "/tabs/generator",
    iconKey: "generate",
    iconKeyActive: "generate-f",
  },
  {
    label: "Send",
    page: "/tabs/send",
    iconKey: "send",
    iconKeyActive: "send-f",
  },
  {
    label: "Settings",
    page: "/tabs/settings",
    iconKey: "cog",
    iconKeyActive: "cog-f",
  },
];

@Component({
  selector: "popup-tab-navigation",
  templateUrl: "popup-tab-navigation.component.html",
  standalone: true,
  imports: [CommonModule, LinkModule, RouterModule],
  host: {
    class: "tw-block tw-h-full tw-w-full tw-flex tw-flex-col",
  },
})
export class PopupTabNavigationComponent {
  navButtons = allNavButtons;
  constructor(
    private policyService: PolicyService,
    private sendService: SendService,
  ) {
    this.policyService
      .policyAppliesToActiveUser$(PolicyType.DisableSend)
      .pipe(
        filter((policyAppliesToActiveUser) => policyAppliesToActiveUser),
        switchMap(() => this.sendService.sends$),
        map((sends) => sends.length > 0),
        takeUntilDestroyed(),
      )
      .subscribe((hasSends) => {
        this.navButtons = hasSends
          ? allNavButtons
          : allNavButtons.filter((b) => b.page !== "/tabs/send");
      });
  }
}
