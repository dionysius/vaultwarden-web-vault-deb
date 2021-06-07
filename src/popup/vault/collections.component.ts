import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { CollectionsComponent as BaseCollectionsComponent } from 'jslib-angular/components/collections.component';

@Component({
    selector: 'app-vault-collections',
    templateUrl: 'collections.component.html',
})
export class CollectionsComponent extends BaseCollectionsComponent {
    constructor(collectionService: CollectionService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, cipherService: CipherService,
        private route: ActivatedRoute, private location: Location) {
        super(collectionService, platformUtilsService, i18nService, cipherService);
    }

    async ngOnInit() {
        this.onSavedCollections.subscribe(() => {
            this.back();
        });
        const queryParamsSub = this.route.queryParams.subscribe(async params => {
            this.cipherId = params.cipherId;
            await this.load();
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
    }

    back() {
        this.location.back();
    }
}
