import { Component } from '@angular/core';

import { ConstantsService } from 'jslib/services/constants.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
})
export class HomeComponent {
    constructor(protected platformUtilsService: PlatformUtilsService,
        private passwordGenerationService: PasswordGenerationService, private storageService: StorageService,
        private cryptoFunctionService: CryptoFunctionService, private environmentService: EnvironmentService) { }

    async launchSsoBrowser() {
        // Generate necessary sso params
        const passwordOptions: any = {
            type: 'password',
            length: 64,
            uppercase: true,
            lowercase: true,
            numbers: true,
            special: false,
        };

        const state = (await this.passwordGenerationService.generatePassword(passwordOptions)) + ':clientId=browser';
        const codeVerifier = await this.passwordGenerationService.generatePassword(passwordOptions);
        const codeVerifierHash = await this.cryptoFunctionService.hash(codeVerifier, 'sha256');
        const codeChallenge = Utils.fromBufferToUrlB64(codeVerifierHash);

        await this.storageService.save(ConstantsService.ssoCodeVerifierKey, codeVerifier);
        await this.storageService.save(ConstantsService.ssoStateKey, state);

        let url = this.environmentService.getWebVaultUrl();
        if (url == null) {
            url = 'https://vault.bitwarden.com';
        }

        const redirectUri = url + '/sso-connector.html';

        // Launch browser
        this.platformUtilsService.launchUri(url + '/#/sso?clientId=browser' +
            '&redirectUri=' + encodeURIComponent(redirectUri) +
            '&state=' + state + '&codeChallenge=' + codeChallenge);
    }
}
