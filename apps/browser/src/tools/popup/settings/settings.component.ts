import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, Subject } from "rxjs";

import { VaultTimeoutService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout.service";
import { DeviceType } from "@bitwarden/common/enums";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

import { BrowserApi } from "../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";

import { AboutComponent } from "./about/about.component";

const RateUrls = {
  [DeviceType.ChromeExtension]:
    "https://chromewebstore.google.com/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb/reviews",
  [DeviceType.FirefoxExtension]:
    "https://addons.mozilla.org/en-US/firefox/addon/bitwarden-password-manager/#reviews",
  [DeviceType.OperaExtension]:
    "https://addons.opera.com/en/extensions/details/bitwarden-free-password-manager/#feedback-container",
  [DeviceType.EdgeExtension]:
    "https://microsoftedge.microsoft.com/addons/detail/jbkfoedolllekgbhcbcoahefnbanhhlh",
  [DeviceType.VivaldiExtension]:
    "https://chromewebstore.google.com/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb/reviews",
  [DeviceType.SafariExtension]: "https://apps.apple.com/app/bitwarden/id1352778147",
};

@Component({
  selector: "tools-settings",
  templateUrl: "settings.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class SettingsComponent implements OnInit {
  private destroy$ = new Subject<void>();

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private vaultTimeoutService: VaultTimeoutService,
    public messagingService: MessagingService,
    private router: Router,
    private environmentService: EnvironmentService,
    private dialogService: DialogService,
  ) {}

  async ngOnInit() {}

  async share() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "learnOrg" },
      content: { key: "learnOrgConfirmation" },
      type: "info",
    });
    if (confirmed) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.createNewTab("https://bitwarden.com/help/about-organizations/");
    }
  }

  async webVault() {
    const env = await firstValueFrom(this.environmentService.environment$);
    const url = env.getWebVaultUrl();
    await BrowserApi.createNewTab(url);
  }

  async import() {
    await this.router.navigate(["/import"]);
    if (await BrowserApi.isPopupOpen()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserPopupUtils.openCurrentPagePopout(window);
    }
  }

  export() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate(["/export"]);
  }

  about() {
    this.dialogService.open(AboutComponent);
  }

  rate() {
    const deviceType = this.platformUtilsService.getDevice();
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab((RateUrls as any)[deviceType]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
