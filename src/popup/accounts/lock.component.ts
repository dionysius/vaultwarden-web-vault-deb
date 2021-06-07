import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { LockComponent as BaseLockComponent } from 'jslib-angular/components/lock.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent {
    constructor(router: Router, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        storageService: StorageService, vaultTimeoutService: VaultTimeoutService,
        environmentService: EnvironmentService, stateService: StateService,
        apiService: ApiService) {
        super(router, i18nService, platformUtilsService, messagingService, userService, cryptoService,
            storageService, vaultTimeoutService, environmentService, stateService, apiService);
        this.successRoute = '/tabs/current';
    }

    async ngOnInit() {
        await super.ngOnInit();
        window.setTimeout(() => {
            document.getElementById(this.pinLock ? 'pin' : 'masterPassword').focus();
        }, 100);
    }

    async unlockBiometric() {
        if (!this.biometricLock) {
            return;
        }

        const div = document.createElement('div');
        div.innerHTML = `<div class="swal2-text">${this.i18nService.t('awaitDesktop')}</div>`;

        Swal.fire({
            heightAuto: false,
            buttonsStyling: false,
            html: div,
            showCancelButton: true,
            cancelButtonText: this.i18nService.t('cancel'),
            showConfirmButton: false,
        });

        await super.unlockBiometric();

        Swal.close();
    }
}
