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

import { ApiService } from 'jslib/abstractions/api.service';
import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EventService } from 'jslib/abstractions/event.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';
import { Cipher } from 'jslib/models/domain';
import { LoginUriView } from 'jslib/models/view';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { ViewComponent as BaseViewComponent } from 'jslib/angular/components/view.component';
import { BrowserApi } from '../../browser/browserApi';
import { AutofillService } from '../../services/abstractions/autofill.service';
import { PopupUtilsService } from '../services/popup-utils.service';

import { CipherType } from 'jslib/enums';

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
        eventService: EventService, private autofillService: AutofillService, apiService: ApiService,
        private messagingService: MessagingService, private popupUtilsService: PopupUtilsService) {
        super(cipherService, totpService, tokenService, i18nService, cryptoService, platformUtilsService,
            auditService, window, broadcasterService, ngZone, changeDetectorRef, userService, eventService, apiService);
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

    edit() {
        if (this.cipher.isDeleted) {
            return false;
        }
        super.edit();
        this.router.navigate(['/edit-cipher'], { queryParams: { cipherId: this.cipher.id } });
    }

    clone() {
        if (this.cipher.isDeleted) {
            return false;
        }
        super.clone();
        this.router.navigate(['/clone-cipher'], {
            queryParams: {
                cloneMode: true,
                cipherId: this.cipher.id,
            },
        });
    }

    share() {
        super.share();
        if (this.cipher.organizationId == null) {
            this.router.navigate(['/share-cipher'], { replaceUrl: true, queryParams: { cipherId: this.cipher.id } });
        }
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
