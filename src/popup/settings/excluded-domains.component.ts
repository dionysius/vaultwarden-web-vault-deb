import {
    Component,
    OnInit,
    NgZone,
    OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { ConstantsService } from 'jslib/services/constants.service';
import { BrowserApi } from '../../browser/browserApi';
import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';
import { Utils } from 'jslib/misc/utils';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

interface ExcludedDomain {
    uri: string,
    showCurrentUris: boolean
}

const BroadcasterSubscriptionId = 'excludedDomains';

@Component({
    selector: 'app-excluded-domains',
    templateUrl: 'excluded-domains.component.html',
})
export class ExcludedDomainsComponent implements OnInit, OnDestroy {
    excludedDomains: ExcludedDomain[] = [];
    currentUris: string[];
    loadCurrentUrisTimeout: number;

    constructor(private storageService: StorageService,
        private i18nService: I18nService, private router: Router,
        private broadcasterService: BroadcasterService, private ngZone: NgZone,
        private platformUtilsService: PlatformUtilsService) {
    }

    async ngOnInit() {
        const savedDomains = await this.storageService.get<any>(ConstantsService.neverDomainsKey);
        if (savedDomains) {
            for (const uri of Object.keys(savedDomains)) {
                this.excludedDomains.push({uri: uri, showCurrentUris: false})
            }
        }

        this.loadCurrentUris();

        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'tabChanged':
                    case 'windowChanged':
                        if (this.loadCurrentUrisTimeout != null) {
                            window.clearTimeout(this.loadCurrentUrisTimeout);
                        }
                        this.loadCurrentUrisTimeout = window.setTimeout(() => this.loadCurrentUris(), 500);
                        break;
                    default:
                        break;
                }
            });
        });
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async addUri() {
        this.excludedDomains.push({uri: '', showCurrentUris: false})
    }

    async removeUri(i: number) {
        this.excludedDomains.splice(i, 1);
    }

    async submit() {
        const savedDomains: {[name: string]: null} = {};
        for (const domain of this.excludedDomains) {
            if (domain.uri && domain.uri !== '') {
                const validDomain = Utils.getHostname(domain.uri);
                if (!validDomain) {
                    this.platformUtilsService.showToast('error', null,
                        '\'' + domain.uri + '\'' + this.i18nService.t('excludedDomainsInvalidDomain'));
                    return;
                }
                savedDomains[validDomain] = null
            }
        }
        await this.storageService.save(ConstantsService.neverDomainsKey, savedDomains);
        this.router.navigate(['/tabs/settings']);
    }

    trackByFunction(index: number, item: any) {
        return index;
    }

    toggleUriInput(domain: ExcludedDomain) {
        domain.showCurrentUris = !domain.showCurrentUris;
    }

    async loadCurrentUris() {
        const tabs = await BrowserApi.tabsQuery({ windowType: 'normal' });
        if (tabs) {
            const uriSet = new Set(tabs.map((tab) => Utils.getHostname(tab.url)));
            uriSet.delete(null);
            this.currentUris = Array.from(uriSet);
        }
    }
}