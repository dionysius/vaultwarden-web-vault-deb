import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';

import { RegisterComponent as BaseRegisterComponent } from 'jslib-angular/components/register.component';

@Component({
    selector: 'app-register',
    templateUrl: 'register.component.html',
})
export class RegisterComponent extends BaseRegisterComponent {
    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, cryptoService: CryptoService,
        apiService: ApiService, stateService: StateService, platformUtilsService: PlatformUtilsService,
        passwordGenerationService: PasswordGenerationService, environmentService: EnvironmentService) {
        super(authService, router, i18nService, cryptoService, apiService, stateService, platformUtilsService,
            passwordGenerationService, environmentService);
    }
}
