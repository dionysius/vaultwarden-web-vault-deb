import { Component } from '@angular/core';

import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { PlatformUtilsService } from '../../../jslib/src/abstractions/platformUtils.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
})
export class HomeComponent { 
    constructor(
        protected platformUtilsService: PlatformUtilsService, private passwordGenerationService : PasswordGenerationService,
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

            const state = await this.passwordGenerationService.generatePassword(passwordOptions);
            let ssoCodeVerifier = await this.passwordGenerationService.generatePassword(passwordOptions);
            const codeVerifierHash = await this.cryptoFunctionService.hash(ssoCodeVerifier, 'sha256');
            const codeChallenge = Utils.fromBufferToUrlB64(codeVerifierHash);
    
            const webUrl = 'https://localhost:8080';
            const clientId = 'browser';
            const ssoRedirectUri = 'https://localhost:8080/sso-connector.html';
    
            // Launch browser
            this.platformUtilsService.launchUri(webUrl + '/#/sso?clientId=' + clientId +
                '&redirectUri=' + encodeURIComponent(ssoRedirectUri) +
                '&state=' + state + '&codeChallenge=' + codeChallenge +
                '&codeVerifier=' + ssoCodeVerifier);
        }   
}
