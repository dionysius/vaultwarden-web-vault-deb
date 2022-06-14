import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { TwoFactorOptionsComponent as BaseTwoFactorOptionsComponent } from "@bitwarden/angular/components/two-factor-options.component";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { TwoFactorService } from "@bitwarden/common/abstractions/twoFactor.service";

@Component({
  selector: "app-two-factor-options",
  templateUrl: "two-factor-options.component.html",
})
export class TwoFactorOptionsComponent extends BaseTwoFactorOptionsComponent {
  constructor(
    twoFactorService: TwoFactorService,
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService
  ) {
    super(twoFactorService, router, i18nService, platformUtilsService, window);
  }

  choose(p: any) {
    super.choose(p);
    this.twoFactorService.setSelectedProvider(p.type);
    this.router.navigate(["2fa"]);
  }
}
