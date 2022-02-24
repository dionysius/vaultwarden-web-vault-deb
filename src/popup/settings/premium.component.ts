import { CurrencyPipe } from "@angular/common";
import { Component } from "@angular/core";

import { PremiumComponent as BasePremiumComponent } from "jslib-angular/components/premium.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";

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
}
