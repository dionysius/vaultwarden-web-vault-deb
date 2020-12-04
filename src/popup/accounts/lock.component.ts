import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { LockComponent as BaseLockComponent } from 'jslib/angular/components/lock.component';
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
