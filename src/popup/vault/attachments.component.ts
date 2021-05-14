import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { AttachmentsComponent as BaseAttachmentsComponent } from 'jslib/angular/components/attachments.component';

@Component({
    selector: 'app-vault-attachments',
    templateUrl: 'attachments.component.html',
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
    openedAttachmentsInPopup: boolean;

    constructor(cipherService: CipherService, i18nService: I18nService,
        cryptoService: CryptoService, userService: UserService,
        platformUtilsService: PlatformUtilsService, apiService: ApiService, private location: Location,
        private route: ActivatedRoute, private router: Router) {
        super(cipherService, i18nService, cryptoService, userService, platformUtilsService, apiService, window);
    }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(async params => {
            this.cipherId = params.cipherId;
            await this.init();
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });

        this.openedAttachmentsInPopup = history.length === 1;
    }

    back() {
        this.location.back();
    }

    close() {
        window.close();
    }
}
