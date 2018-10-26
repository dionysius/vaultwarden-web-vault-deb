import { Angulartics2 } from 'angulartics2';

import { Location } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { BrowserApi } from '../../browser/browserApi';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { StateService } from 'jslib/abstractions/state.service';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';
import { CollectionView } from 'jslib/models/view/collectionView';
import { FolderView } from 'jslib/models/view/folderView';

import { TreeNode } from 'jslib/models/domain/treeNode';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

import { PopupUtilsService } from '../services/popup-utils.service';

const ComponentId = 'CiphersComponent';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent implements OnInit, OnDestroy {
    groupingTitle: string;
    state: any;
    showAdd = true;
    folderId: string = null;
    type: CipherType = null;
    pagedCiphers: CipherView[] = [];
    nestedFolders: Array<TreeNode<FolderView>>;
    nestedCollections: Array<TreeNode<CollectionView>>;

    private didScroll = false;
    private selectedTimeout: number;
    private preventSelected = false;
    private pageSize = 100;

    constructor(searchService: SearchService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        private ngZone: NgZone, private broadcasterService: BroadcasterService,
        private changeDetectorRef: ChangeDetectorRef, private stateService: StateService,
        private popupUtils: PopupUtilsService, private i18nService: I18nService,
        private folderService: FolderService, private collectionService: CollectionService,
        private analytics: Angulartics2, private platformUtilsService: PlatformUtilsService) {
        super(searchService);
        this.pageSize = platformUtilsService.isEdge() ? 25 : 100;
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.type) {
                this.searchPlaceholder = this.i18nService.t('searchType');
                this.type = parseInt(params.type, null);
                switch (this.type) {
                    case CipherType.Login:
                        this.groupingTitle = this.i18nService.t('logins');
                        break;
                    case CipherType.Card:
                        this.groupingTitle = this.i18nService.t('cards');
                        break;
                    case CipherType.Identity:
                        this.groupingTitle = this.i18nService.t('identities');
                        break;
                    case CipherType.SecureNote:
                        this.groupingTitle = this.i18nService.t('secureNotes');
                        break;
                    default:
                        break;
                }
                await super.load((c) => c.type === this.type);
            } else if (params.folderId) {
                this.folderId = params.folderId === 'none' ? null : params.folderId;
                this.searchPlaceholder = this.i18nService.t('searchFolder');
                if (this.folderId != null) {
                    const folderNode = await this.folderService.getNested(this.folderId);
                    if (folderNode != null && folderNode.node != null) {
                        this.groupingTitle = folderNode.node.name;
                        this.nestedFolders = folderNode.children != null && folderNode.children.length > 0 ?
                            folderNode.children : null;
                    }
                } else {
                    this.groupingTitle = this.i18nService.t('noneFolder');
                }
                await super.load((c) => c.folderId === this.folderId);
            } else if (params.collectionId) {
                this.showAdd = false;
                this.searchPlaceholder = this.i18nService.t('searchCollection');
                const collectionNode = await this.collectionService.getNested(params.collectionId);
                if (collectionNode != null && collectionNode.node != null) {
                    this.groupingTitle = collectionNode.node.name;
                    this.nestedCollections = collectionNode.children != null && collectionNode.children.length > 0 ?
                        collectionNode.children : null;
                }
                await super.load((c) => c.collectionIds != null && c.collectionIds.indexOf(params.collectionId) > -1);
            } else {
                this.groupingTitle = this.i18nService.t('allItems');
                await super.load();
            }

            this.loadMore();
            this.state = (await this.stateService.get<any>(ComponentId)) || {};
            if (this.state.searchText) {
                this.searchText = this.state.searchText;
            }
            window.setTimeout(() => this.popupUtils.setContentScrollY(window, this.state.scrollY), 0);

            // TODO: This is pushing a new page onto the browser navigation history. Figure out how to now do that
            // so that we don't have to hit back button twice
            const newUrl = this.router.createUrlTree([], {
                queryParams: { direction: null },
                queryParamsHandling: 'merge',
                preserveFragment: true,
                replaceUrl: true,
            }).toString();
            this.location.go(newUrl);
        });

        this.broadcasterService.subscribe(ComponentId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'syncCompleted':
                        if (message.successfully) {
                            window.setTimeout(() => {
                                this.refresh();
                            }, 500);
                        }
                        break;
                    default:
                        break;
                }

                this.changeDetectorRef.detectChanges();
            });
        });
    }

    ngOnDestroy() {
        this.saveState();
        this.broadcasterService.unsubscribe(ComponentId);
    }

    selectCipher(cipher: CipherView) {
        this.selectedTimeout = window.setTimeout(() => {
            if (!this.preventSelected) {
                super.selectCipher(cipher);
                this.router.navigate(['/view-cipher'], { queryParams: { cipherId: cipher.id } });
            }
            this.preventSelected = false;
        }, 200);
    }

    selectFolder(folder: FolderView) {
        if (folder.id != null) {
            this.router.navigate(['/ciphers'], { queryParams: { folderId: folder.id, direction: 'f' } });
        }
    }

    selectCollection(collection: CollectionView) {
        this.router.navigate(['/ciphers'], { queryParams: { collectionId: collection.id, direction: 'f' } });
    }

    async launchCipher(cipher: CipherView) {
        if (cipher.type !== CipherType.Login || !cipher.login.canLaunch) {
            return;
        }

        if (this.selectedTimeout != null) {
            window.clearTimeout(this.selectedTimeout);
        }
        this.preventSelected = true;
        this.analytics.eventTrack.next({ action: 'Launched URI From Listing' });
        BrowserApi.createNewTab(cipher.login.uri);
        if (this.popupUtils.inPopup(window)) {
            BrowserApi.closePopup(window);
        }
    }

    addCipher() {
        super.addCipher();
        this.router.navigate(['/add-cipher'], { queryParams: { folderId: this.folderId, type: this.type } });
    }

    back() {
        this.location.back();
    }

    loadMore() {
        if (this.ciphers.length <= this.pageSize) {
            return;
        }

        const pagedLength = this.pagedCiphers.length;
        if (this.ciphers.length > pagedLength) {
            this.pagedCiphers = this.pagedCiphers.concat(this.ciphers.slice(pagedLength, pagedLength + this.pageSize));
        }
        this.didScroll = this.pagedCiphers.length > this.pageSize;
    }

    isSearching() {
        return !this.searchPending && this.searchService.isSearchable(this.searchText);
    }

    isPaging() {
        const searching = this.isSearching();
        if (searching && this.didScroll) {
            this.resetPaging();
        }
        return !searching && this.ciphers.length > this.pageSize;
    }

    routerCanReuse() {
        return false;
    }

    async resetPaging() {
        this.pagedCiphers = [];
        this.loadMore();
    }

    private async saveState() {
        this.state = {
            scrollY: this.popupUtils.getContentScrollY(window),
            searchText: this.searchText,
        };
        await this.stateService.save(ComponentId, this.state);
    }
}
