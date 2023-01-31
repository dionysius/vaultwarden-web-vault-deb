import { CurrencyPipe, Location } from "@angular/common";
import { Component } from "@angular/core";

import { PremiumComponent as BasePremiumComponent } from "@bitwarden/angular/vault/components/premium.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

@Component({
  selector: "app-premium",
  templateUrl: "premium.component.html",
})
export class PremiumComponent extends BasePremiumComponent {
  priceString: string;

  constructor(
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    apiService: ApiService,
    stateService: StateService,
    logService: LogService,
    private location: Location,
    private currencyPipe: CurrencyPipe
  ) {
    super(i18nService, platformUtilsService, apiService, logService, stateService);

    // Support old price string. Can be removed in future once all translations are properly updated.
    const thePrice = this.currencyPipe.transform(this.price, "$");
    this.priceString = i18nService.t("premiumPrice", thePrice);
    if (this.priceString.indexOf("%price%") > -1) {
      this.priceString = this.priceString.replace("%price%", thePrice);
    }
  }

  goBack() {
    this.location.back();
  }
}
