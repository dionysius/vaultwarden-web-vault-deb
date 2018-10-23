import { Location } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { UserService } from 'jslib/abstractions/user.service';
import { AuditService } from 'jslib/abstractions/audit.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';

import { Organization } from 'jslib/models/domain/organization';
import { CipherView } from 'jslib/models/view/cipherView';
import { CollectionView } from 'jslib/models/view/collectionView';

@Component({
    selector: 'app-vault-share',
    templateUrl: 'share.component.html',
})
export class ShareComponent implements OnInit, OnDestroy {
    formPromise: Promise<any>;
    cipher: CipherView;
    cipherId: string;
    organizationId: string;
    collections: CollectionView[] = [];
    organizations: Organization[] = [];

    private writeableCollections: CollectionView[] = [];

    constructor(private cipherService: CipherService, private collectionService: CollectionService, 
        private userService: UserService, private i18nService: I18nService, 
        private route: ActivatedRoute, private location: Location, 
        private toasterService: ToasterService, private analytics: Angulartics2) {
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            }
        });
        
        
        const cipherDomain = await this.cipherService.get(this.cipherId);
        this.cipher = await cipherDomain.decrypt();
        const allCollections = await this.collectionService.getAllDecrypted();
        this.writeableCollections = allCollections.filter((c) => !c.readOnly);
        this.organizations = await this.userService.getAllOrganizations();
        if (this.organizationId == null && this.organizations.length > 0) {
            this.organizationId = this.organizations[0].id;
        }
        this.filterCollections();
    }

    ngOnDestroy() {
    }

    filterCollections() {
        if (this.organizationId == null || this.writeableCollections.length === 0) {
            this.collections = [];
        } else {
            this.collections = this.writeableCollections.filter((c) => c.organizationId === this.organizationId);
        }
    }

    async submit() {
        const cipherDomain = await this.cipherService.get(this.cipherId);
        const cipherView = await cipherDomain.decrypt();

        const attachmentPromises: Array<Promise<any>> = [];
        if (cipherView.attachments != null) {
            for (const attachment of cipherView.attachments) {
                const promise = this.cipherService.shareAttachmentWithServer(attachment,
                    cipherView.id, this.organizationId);
                attachmentPromises.push(promise);
            }
        }

        const checkedCollectionIds = this.collections.filter((c) => (c as any).checked).map((c) => c.id);
        try {
            this.formPromise = Promise.all(attachmentPromises).then(async () => {
                await this.cipherService.shareWithServer(cipherView, this.organizationId, checkedCollectionIds);
                this.analytics.eventTrack.next({ action: 'Shared Cipher' });
                this.toasterService.popAsync('success', null, this.i18nService.t('sharedItem'));
            });
            await this.formPromise;
        } catch { }
    }

    cancel() {
        this.location.back();
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    get canSave() {
        if (this.collections != null) {
            for (let i = 0; i < this.collections.length; i++) {
                if ((this.collections[i] as any).checked) {
                    return true;
                }
            }
        }
        return false;
    }
}
