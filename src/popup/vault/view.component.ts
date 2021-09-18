import { Location } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    NgZone,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuditService } from 'jslib-common/abstractions/audit.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PasswordRepromptService } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { TokenService } from 'jslib-common/abstractions/token.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { Cipher } from 'jslib-common/models/domain/cipher';
import { LoginUriView } from 'jslib-common/models/view/loginUriView';

import { CipherType } from 'jslib-common/enums/cipherType';

import { ViewComponent as BaseViewComponent } from 'jslib-angular/components/view.component';
import { BrowserApi } from '../../browser/browserApi';
import { AutofillService } from '../../services/abstractions/autofill.service';
import { PopupUtilsService } from '../services/popup-utils.service';

const BroadcasterSubscriptionId = 'ChildViewComponent';

@Component({
    selector: 'app-vault-view',
    templateUrl: 'view.component.html',
})
export class ViewComponent extends BaseViewComponent {
    showAttachments = true;
    pageDetails: any[] = [];
    tab: any;
    loadPageDetailsTimeout: number;
    inPopout = false;
    cipherType = CipherType;

    constructor(cipherService: CipherService, totpService: TotpService,
        tokenService: TokenService, i18nService: I18nService,
        cryptoService: CryptoService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        broadcasterService: BroadcasterService, ngZone: NgZone,
        changeDetectorRef: ChangeDetectorRef, userService: UserService,
        eventService: EventService, private autofillService: AutofillService,
        private messagingService: MessagingService, private popupUtilsService: PopupUtilsService,
        apiService: ApiService, passwordRepromptService: PasswordRepromptService) {
        super(cipherService, totpService, tokenService, i18nService, cryptoService, platformUtilsService,
            auditService, window, broadcasterService, ngZone, changeDetectorRef, userService, eventService,
            apiService, passwordRepromptService);
    }

    ngOnInit() {
        this.inPopout = this.popupUtilsService.inPopout(window);
        const queryParamsSub = this.route.queryParams.subscribe(async params => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            } else {
                this.close();
            }

            await this.load();
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });

        super.ngOnInit();

        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'collectPageDetailsResponse':
                        if (message.sender === BroadcasterSubscriptionId) {
                            this.pageDetails.push({
                                frameId: message.webExtSender.frameId,
                                tab: message.tab,
                                details: message.details,
                            });
                        }
                        break;
                    case 'tabChanged':
                    case 'windowChanged':
                        if (this.loadPageDetailsTimeout != null) {
                            window.clearTimeout(this.loadPageDetailsTimeout);
                        }
                        this.loadPageDetailsTimeout = window.setTimeout(() => this.loadPageDetails(), 500);
                        break;
                    default:
                        break;
                }
            });
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        await super.load();
        await this.loadPageDetails();
    }

    async edit() {
        if (this.cipher.isDeleted) {
            return false;
        }
        if (!await super.edit()) {
            return false;
        }

        this.router.navigate(['/edit-cipher'], { queryParams: { cipherId: this.cipher.id } });
        return true;
    }

    async clone() {
        if (this.cipher.isDeleted) {
            return false;
        }

        if (!await super.clone()) {
            return false;
        }

        this.router.navigate(['/clone-cipher'], {
            queryParams: {
                cloneMode: true,
                cipherId: this.cipher.id,
            },
        });
        return true;
    }

    async share() {
        if (!await super.share()) {
            return false;
        }

        if (this.cipher.organizationId == null) {
            this.router.navigate(['/share-cipher'], { replaceUrl: true, queryParams: { cipherId: this.cipher.id } });
        }
        return true;
    }

    async fillCipher() {
        const didAutofill = await this.doAutofill();
        if (didAutofill) {
            this.platformUtilsService.showToast('success', null,
                this.i18nService.t('autoFillSuccess'));
        }
    }

    async fillCipherAndSave() {
        const didAutofill = await this.doAutofill();

        if (didAutofill) {
            if (this.tab == null) {
                throw new Error('No tab found.');
            }

            if (this.cipher.login.uris == null) {
                this.cipher.login.uris = [];
            } else {
                if (this.cipher.login.uris.some(uri => uri.uri === this.tab.url)) {
                    this.platformUtilsService.showToast('success', null,
                        this.i18nService.t('autoFillSuccessAndSavedUri'));
                    return;
                }
            }

            const loginUri = new LoginUriView();
            loginUri.uri = this.tab.url;
            this.cipher.login.uris.push(loginUri);

            try {
                const cipher: Cipher = await this.cipherService.encrypt(this.cipher);
                await this.cipherService.saveWithServer(cipher);
                this.platformUtilsService.showToast('success', null,
                    this.i18nService.t('autoFillSuccessAndSavedUri'));
                this.messagingService.send('editedCipher');
            } catch {
                this.platformUtilsService.showToast('error', null,
                    this.i18nService.t('unexpectedError'));
            }
        }
    }

    async restore() {
        if (!this.cipher.isDeleted) {
            return false;
        }
        if (await super.restore()) {
            this.close();
            return true;
        }
        return false;
    }

    async delete() {
        if (await super.delete()) {
            this.close();
            return true;
        }
        return false;
    }

    close() {
        this.location.back();
    }

    private async loadPageDetails() {
        this.pageDetails = [];
        this.tab = await BrowserApi.getTabFromCurrentWindow();
        if (this.tab == null) {
            return;
        }
        BrowserApi.tabSendMessage(this.tab, {
            command: 'collectPageDetails',
            tab: this.tab,
            sender: BroadcasterSubscriptionId,
        });
    }

    private async doAutofill() {
        if (!await this.promptPassword()) {
            return false;
        }

        if (this.pageDetails == null || this.pageDetails.length === 0) {
            this.platformUtilsService.showToast('error', null,
                this.i18nService.t('autofillError'));
            return false;
        }

        try {
            this.totpCode = await this.autofillService.doAutoFill({
                cipher: this.cipher,
                pageDetails: this.pageDetails,
                doc: window.document,
                fillNewPassword: true,
            });
            if (this.totpCode != null) {
                this.platformUtilsService.copyToClipboard(this.totpCode, { window: window });
            }
        } catch {
            this.platformUtilsService.showToast('error', null,
                this.i18nService.t('autofillError'));
            this.changeDetectorRef.detectChanges();
            return false;
        }

        return true;
    }
}
