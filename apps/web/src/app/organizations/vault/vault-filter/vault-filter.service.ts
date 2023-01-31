import { Injectable, OnDestroy } from "@angular/core";
import { filter, map, Observable, ReplaySubject, Subject, switchMap, takeUntil } from "rxjs";

import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import {
  canAccessVaultTab,
  OrganizationService,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";

import { VaultFilterService as BaseVaultFilterService } from "../../../../vault/app/vault/vault-filter/services/vault-filter.service";
import { CollectionFilter } from "../../../../vault/app/vault/vault-filter/shared/models/vault-filter.type";
import { CollectionAdminView } from "../../core";
import { CollectionAdminService } from "../../core/services/collection-admin.service";

@Injectable()
export class VaultFilterService extends BaseVaultFilterService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private _collections = new ReplaySubject<CollectionAdminView[]>(1);

  filteredCollections$: Observable<CollectionAdminView[]> = this._collections.asObservable();

  collectionTree$: Observable<TreeNode<CollectionFilter>> = this.filteredCollections$.pipe(
    map((collections) => this.buildCollectionTree(collections))
  );

  constructor(
    stateService: StateService,
    organizationService: OrganizationService,
    folderService: FolderService,
    cipherService: CipherService,
    collectionService: CollectionService,
    policyService: PolicyService,
    i18nService: I18nService,
    protected collectionAdminService: CollectionAdminService
  ) {
    super(
      stateService,
      organizationService,
      folderService,
      cipherService,
      collectionService,
      policyService,
      i18nService
    );
    this.loadSubscriptions();
  }

  protected loadSubscriptions() {
    this._organizationFilter
      .pipe(
        filter((org) => org != null),
        switchMap((org) => {
          return this.loadCollections(org);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((collections) => {
        this._collections.next(collections);
      });
  }

  async reloadCollections() {
    this._collections.next(await this.loadCollections(this._organizationFilter.getValue()));
  }

  protected async loadCollections(org: Organization): Promise<CollectionAdminView[]> {
    let collections: CollectionAdminView[] = [];
    if (canAccessVaultTab(org)) {
      collections = await this.collectionAdminService.getAll(org.id);

      const noneCollection = new CollectionAdminView();
      noneCollection.name = this.i18nService.t("unassigned");
      noneCollection.organizationId = org.id;
      collections.push(noneCollection);
    }
    return collections;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
