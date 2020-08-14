import { Component } from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import BrowserPlatformUtilsService from '../../services/browserPlatformUtils.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { ConstantsService } from 'jslib/services/constants.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { SsoComponent as BaseSsoComponent } from 'jslib/angular/components/sso.component';

@Component({
    selector: 'app-sso',
    templateUrl: 'sso.component.html',
})
export class SsoComponent extends BaseSsoComponent {
    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, route: ActivatedRoute,
        storageService: StorageService, stateService: StateService,
        platformUtilsService: PlatformUtilsService, apiService: ApiService,
        cryptoFunctionService: CryptoFunctionService, passwordGenerationService: PasswordGenerationService,
        syncService: SyncService, private browserPlatformUtilsService: BrowserPlatformUtilsService,
        private environmentService: EnvironmentService  ) {
        super(authService, router, i18nService, route, storageService, stateService, platformUtilsService,
            apiService, cryptoFunctionService, passwordGenerationService);
            
        let url = this.environmentService.getWebVaultUrl();
        if (url == null) {
            url = 'https://vault.bitwarden.com';
        }
            
        this.redirectUri = url + '/sso-connector.html';
        this.clientId = 'browser';
        
        super.onSuccessfulLogin = () => {
                var sidebarName : string = this.browserPlatformUtilsService.sidebarViewName();
                var sidebarWindows = chrome.extension.getViews({ type: sidebarName });
                if(sidebarWindows && sidebarWindows.length > 0) {
                    sidebarWindows[0].location.reload();
                }

                return syncService.fullSync(true);
        };

        super.onSuccessfulLoginTwoFactorNavigate = () => {
            return router.navigate(['2fa']);
        }
    }
}
