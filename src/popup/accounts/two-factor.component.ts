import {
    ChangeDetectorRef,
    Component,
    NgZone,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { TwoFactorComponent as BaseTwoFactorComponent } from 'jslib/angular/components/two-factor.component';

import { PopupUtilsService } from '../services/popup-utils.service';

import { BrowserApi } from '../../browser/browserApi';

const BroadcasterSubscriptionId = 'TwoFactorComponent';

@Component({
    selector: 'app-two-factor',
    templateUrl: 'two-factor.component.html',
})
export class TwoFactorComponent extends BaseTwoFactorComponent {
    showNewWindowMessage = false;

    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, apiService: ApiService,
        platformUtilsService: PlatformUtilsService, private syncService: SyncService,
        environmentService: EnvironmentService, private ngZone: NgZone,
        private broadcasterService: BroadcasterService, private changeDetectorRef: ChangeDetectorRef,
        private popupUtilsService: PopupUtilsService, stateService: StateService,
        storageService: StorageService, route: ActivatedRoute, private messagingService: MessagingService) {
        super(authService, router, i18nService, apiService, platformUtilsService, window, environmentService,
            stateService, storageService, route);
        super.onSuccessfulLogin = () => {
            return syncService.fullSync(true);
        };
        super.successRoute = '/tabs/vault';
        this.webAuthnNewTab = this.platformUtilsService.isFirefox() || this.platformUtilsService.isSafari();
    }

    async ngOnInit() {
        if (this.route.snapshot.paramMap.has('webAuthnResponse')) {
            // WebAuthn fallback response
            this.selectedProviderType = TwoFactorProviderType.WebAuthn;
            this.token = this.route.snapshot.paramMap.get('webAuthnResponse');
            super.onSuccessfulLogin = async () => {
                this.syncService.fullSync(true);
                this.messagingService.send('reloadPopup');
                window.close();
            };
            this.remember = this.route.snapshot.paramMap.get('remember') === 'true';
            await this.doSubmit();
            return;
        }

        await super.ngOnInit();
        if (this.selectedProviderType == null) {
            return;
        }

        // WebAuthn prompt appears inside the popup on linux, and requires a larger popup width
        // than usual to avoid cutting off the dialog.
        if (this.selectedProviderType === TwoFactorProviderType.WebAuthn && await this.isLinux()) {
            document.body.classList.add('linux-webauthn');
        }

        if (this.selectedProviderType === TwoFactorProviderType.Email &&
            this.popupUtilsService.inPopup(window)) {
            const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('popup2faCloseMessage'),
                null, this.i18nService.t('yes'), this.i18nService.t('no'));
            if (confirmed) {
                this.popupUtilsService.popOut(window);
            }
        }

        const queryParamsSub = this.route.queryParams.subscribe(async qParams => {
            if (qParams.sso === 'true') {
                super.onSuccessfulLogin = () => {
                    BrowserApi.reloadOpenWindows();
                    const thisWindow = window.open('', '_self');
                    thisWindow.close();
                    return this.syncService.fullSync(true);
                };
                if (queryParamsSub != null) {
                    queryParamsSub.unsubscribe();
                }
            }
        });
    }

    async ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);

        if (this.selectedProviderType === TwoFactorProviderType.WebAuthn && await this.isLinux()) {
            document.body.classList.remove('linux-webauthn');
        }
        super.ngOnDestroy();
    }

    anotherMethod() {
        this.router.navigate(['2fa-options']);
    }

    async isLinux() {
        return (await BrowserApi.getPlatformInfo()).os === 'linux';
    }
}
