import { Location } from '@angular/common';
import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { BrowserApi } from '../../browser/browserApi';

import { AuditService } from 'jslib-common/abstractions/audit.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ConstantsService } from 'jslib-common/services/constants.service';
import { PopupUtilsService } from '../services/popup-utils.service';

import { LoginUriView } from 'jslib-common/models/view/loginUriView';

import { AddEditComponent as BaseAddEditComponent } from 'jslib-angular/components/add-edit.component';

import { CipherType } from 'jslib-common/enums/cipherType';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent {
    currentUris: string[];
    showAttachments = true;
    openAttachmentsInPopup: boolean;
    showAutoFillOnPageLoadOptions: boolean;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, collectionService: CollectionService,
        messagingService: MessagingService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        eventService: EventService, policyService: PolicyService,
        private popupUtilsService: PopupUtilsService, private storageService: StorageService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            userService, collectionService, messagingService, eventService, policyService);
    }

    async ngOnInit() {
        await super.ngOnInit();

        const queryParamsSub = this.route.queryParams.subscribe(async params => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            }
            if (params.folderId) {
                this.folderId = params.folderId;
            }
            if (params.collectionId) {
                const collection = this.writeableCollections.find(c => c.id === params.collectionId);
                if (collection != null) {
                    this.collectionIds = [collection.id];
                    this.organizationId = collection.organizationId;
                }
            }
            if (params.type) {
                const type = parseInt(params.type, null);
                this.type = type;
            }
            this.editMode = !params.cipherId;

            if (params.cloneMode != null) {
                this.cloneMode = params.cloneMode === 'true';
            }
            await this.load();

            if (!this.editMode || this.cloneMode) {
                if (!this.popupUtilsService.inPopout(window) && params.name &&
                    (this.cipher.name == null || this.cipher.name === '')) {
                    this.cipher.name = params.name;
                }
                if (!this.popupUtilsService.inPopout(window) && params.uri &&
                    (this.cipher.login.uris[0].uri == null || this.cipher.login.uris[0].uri === '')) {
                    this.cipher.login.uris[0].uri = params.uri;
                }
            }
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }

            this.openAttachmentsInPopup = this.popupUtilsService.inPopup(window);
        });

        if (!this.editMode) {
            const tabs = await BrowserApi.tabsQuery({ windowType: 'normal' });
            this.currentUris = tabs == null ? null :
                tabs.filter(tab => tab.url != null && tab.url !== '').map(tab => tab.url);
        }

        window.setTimeout(() => {
            if (!this.editMode) {
                if (this.cipher.name != null && this.cipher.name !== '') {
                    document.getElementById('loginUsername').focus();
                } else {
                    document.getElementById('name').focus();
                }
            }
        }, 200);
    }

    async load() {
        await super.load();
        this.showAutoFillOnPageLoadOptions = this.cipher.type === CipherType.Login &&
            await this.storageService.get<boolean>(ConstantsService.enableAutoFillOnPageLoadKey);
    }

    async submit(): Promise<boolean> {
        if (await super.submit()) {
            if (this.cloneMode) {
                this.router.navigate(['/tabs/vault']);
            } else {
                this.location.back();
            }
            return true;
        }

        return false;
    }

    attachments() {
        super.attachments();

        if (this.openAttachmentsInPopup) {
            const destinationUrl = this.router.createUrlTree(['/attachments'], { queryParams: { cipherId: this.cipher.id } }).toString();
            const currentBaseUrl = window.location.href.replace(this.router.url, '');
            this.popupUtilsService.popOut(window, currentBaseUrl + destinationUrl);
        } else {
            this.router.navigate(['/attachments'], { queryParams: { cipherId: this.cipher.id } });
        }
    }


    editCollections() {
        super.editCollections();
        if (this.cipher.organizationId != null) {
            this.router.navigate(['/collections'], { queryParams: { cipherId: this.cipher.id } });
        }
    }

    cancel() {
        super.cancel();
        this.location.back();
    }

    async generatePassword(): Promise<boolean> {
        const confirmed = await super.generatePassword();
        if (confirmed) {
            this.stateService.save('addEditCipherInfo', {
                cipher: this.cipher,
                collectionIds: this.collections == null ? [] :
                    this.collections.filter(c => (c as any).checked).map(c => c.id),
            });
            this.router.navigate(['generator']);
        }
        return confirmed;
    }

    async delete(): Promise<boolean> {
        const confirmed = await super.delete();
        if (confirmed) {
            this.router.navigate(['/tabs/vault']);
        }
        return confirmed;
    }

    toggleUriInput(uri: LoginUriView) {
        const u = (uri as any);
        u.showCurrentUris = !u.showCurrentUris;
    }

    allowOwnershipOptions(): boolean {
        return (!this.editMode || this.cloneMode) && this.ownershipOptions
            && (this.ownershipOptions.length > 1 || !this.allowPersonal);
    }
}
