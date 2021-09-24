import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';

import { LoginComponent as BaseLoginComponent } from 'jslib-angular/components/login.component';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent {
    constructor(authService: AuthService, router: Router,
        protected platformUtilsService: PlatformUtilsService, protected i18nService: I18nService,
        protected stateService: StateService, protected environmentService: EnvironmentService,
        protected passwordGenerationService: PasswordGenerationService,
        protected cryptoFunctionService: CryptoFunctionService, storageService: StorageService,
        syncService: SyncService) {
        super(authService, router, platformUtilsService, i18nService, stateService, environmentService, passwordGenerationService, cryptoFunctionService, storageService);
        super.onSuccessfulLogin = async () => {
            await syncService.fullSync(true);
        };
        super.successRoute = '/tabs/vault';
    }

    settings() {
        this.router.navigate(['environment']);
    }
}
