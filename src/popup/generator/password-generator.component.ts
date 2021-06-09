import { Location } from '@angular/common';
import { Component } from '@angular/core';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';

import { CipherView } from 'jslib-common/models/view/cipherView';

import {
    PasswordGeneratorComponent as BasePasswordGeneratorComponent,
} from 'jslib-angular/components/password-generator.component';

@Component({
    selector: 'app-password-generator',
    templateUrl: 'password-generator.component.html',
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
    private cipherState: CipherView;

    constructor(passwordGenerationService: PasswordGenerationService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, private stateService: StateService,
        private location: Location) {
        super(passwordGenerationService, platformUtilsService, i18nService, window);
    }

    async ngOnInit() {
        await super.ngOnInit();
        const addEditCipherInfo = await this.stateService.get<any>('addEditCipherInfo');
        if (addEditCipherInfo != null) {
            this.cipherState = addEditCipherInfo.cipher;
        }
        this.showSelect = this.cipherState != null;
    }

    select() {
        super.select();
        this.cipherState.login.password = this.password;
        this.close();
    }

    lengthChanged() {
        document.getElementById('length').focus();
    }

    close() {
        this.location.back();
    }
}
