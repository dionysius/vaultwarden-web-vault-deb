import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PremiumComponent as BasePremiumComponent } from 'jslib/angular/components/premium.component';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent extends BasePremiumComponent {
    priceString: string;

    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        apiService: ApiService, userService: UserService,
        private currencyPipe: CurrencyPipe) {
        super(i18nService, platformUtilsService, apiService, userService);

        // Support old price string. Can be removed in future once all translations are properly updated.
        const thePrice = this.currencyPipe.transform(this.price, '$');
        this.priceString = i18nService.t('premiumPrice', thePrice);
        if (this.priceString.indexOf('%price%') > -1) {
            this.priceString = this.priceString.replace('%price%', thePrice);
        }
    }
}
