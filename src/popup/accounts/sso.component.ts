import { Component } from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { SsoComponent as BaseSsoComponent } from 'jslib-angular/components/sso.component';
import { BrowserApi } from '../../browser/browserApi';

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
        syncService: SyncService, environmentService: EnvironmentService, private userService: UserService) {
        super(authService, router, i18nService, route, storageService, stateService, platformUtilsService,
            apiService, cryptoFunctionService, environmentService, passwordGenerationService);

        const url = this.environmentService.getWebVaultUrl();

        this.redirectUri = url + '/sso-connector.html';
        this.clientId = 'browser';

        super.onSuccessfulLogin = async () => {
            await syncService.fullSync(true);
            BrowserApi.reloadOpenWindows();
            const thisWindow = window.open('', '_self');
            thisWindow.close();
        };

        super.onSuccessfulLoginNavigate = async () => {
            if (await this.userService.getForcePasswordReset()) {
                this.router.navigate(['update-temp-password']);
            } else {
                this.router.navigate([this.successRoute]);
            }
        };
    }
}
