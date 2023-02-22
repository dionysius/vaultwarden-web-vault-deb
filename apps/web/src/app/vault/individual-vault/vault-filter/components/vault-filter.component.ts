import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { firstValueFrom, Subject, switchMap, takeUntil } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";

import { VaultFilterService } from "../services/abstractions/vault-filter.service";
import {
  VaultFilterList,
  VaultFilterSection,
  VaultFilterType,
} from "../shared/models/vault-filter-section.type";
import { VaultFilter } from "../shared/models/vault-filter.model";
import {
  CipherStatus,
  CipherTypeFilter,
  CollectionFilter,
  FolderFilter,
  OrganizationFilter,
} from "../shared/models/vault-filter.type";

import { OrganizationOptionsComponent } from "./organization-options.component";

@Component({
  selector: "app-vault-filter",
  templateUrl: "vault-filter.component.html",
})
export class VaultFilterComponent implements OnInit, OnDestroy {
  filters?: VaultFilterList;
  @Input() activeFilter: VaultFilter = new VaultFilter();
  @Output() activeFilterChanged = new EventEmitter<VaultFilter>();
  @Output() onSearchTextChanged = new EventEmitter<string>();
  @Output() onAddFolder = new EventEmitter<never>();
  @Output() onEditFolder = new EventEmitter<FolderFilter>();

  isLoaded = false;
  searchText = "";

  protected destroy$: Subject<void> = new Subject<void>();

  get filtersList() {
    return this.filters ? Object.values(this.filters) : [];
  }

  get searchPlaceholder() {
    if (this.activeFilter.isFavorites) {
      return "searchFavorites";
    }
    if (this.activeFilter.isDeleted) {
      return "searchTrash";
    }
    if (this.activeFilter.cipherType === CipherType.Login) {
      return "searchLogin";
    }
    if (this.activeFilter.cipherType === CipherType.Card) {
      return "searchCard";
    }
    if (this.activeFilter.cipherType === CipherType.Identity) {
      return "searchIdentity";
    }
    if (this.activeFilter.cipherType === CipherType.SecureNote) {
      return "searchSecureNote";
    }
    if (this.activeFilter.selectedFolderNode?.node) {
      return "searchFolder";
    }
    if (this.activeFilter.selectedCollectionNode?.node) {
      return "searchCollection";
    }
    if (this.activeFilter.organizationId === "MyVault") {
      return "searchMyVault";
    }
    if (this.activeFilter.organizationId) {
      return "searchOrganization";
    }

    return "searchVault";
  }

  constructor(
    protected vaultFilterService: VaultFilterService,
    protected policyService: PolicyService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService
  ) {
    this.loadSubscriptions();
  }

  async ngOnInit(): Promise<void> {
    this.filters = await this.buildAllFilters();
    this.activeFilter.selectedCipherTypeNode =
      (await this.getDefaultFilter()) as TreeNode<CipherTypeFilter>;
    this.isLoaded = true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected loadSubscriptions() {
    this.vaultFilterService.filteredFolders$
      .pipe(
        switchMap(async (folders) => {
          this.removeInvalidFolderSelection(folders);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.vaultFilterService.filteredCollections$
      .pipe(
        switchMap(async (collections) => {
          this.removeInvalidCollectionSelection(collections);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  searchTextChanged(t: string) {
    this.searchText = t;
    this.onSearchTextChanged.emit(t);
  }

  protected applyVaultFilter(filter: VaultFilter) {
    this.activeFilterChanged.emit(filter);
  }

  applyOrganizationFilter = async (orgNode: TreeNode<OrganizationFilter>): Promise<void> => {
    if (!orgNode?.node.enabled) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("disabledOrganizationFilterError")
      );
      return;
    }
    const filter = this.activeFilter;
    filter.resetOrganization();
    if (orgNode?.node.id !== "AllVaults") {
      filter.selectedOrganizationNode = orgNode;
    }
    this.vaultFilterService.setOrganizationFilter(orgNode.node);
    await this.vaultFilterService.expandOrgFilter();
    this.applyVaultFilter(filter);
  };

  applyTypeFilter = async (filterNode: TreeNode<CipherTypeFilter>): Promise<void> => {
    const filter = this.activeFilter;
    filter.resetFilter();
    filter.selectedCipherTypeNode = filterNode;
    this.applyVaultFilter(filter);
  };

  applyFolderFilter = async (folderNode: TreeNode<FolderFilter>): Promise<void> => {
    const filter = this.activeFilter;
    filter.resetFilter();
    filter.selectedFolderNode = folderNode;
    this.applyVaultFilter(filter);
  };

  applyCollectionFilter = async (collectionNode: TreeNode<CollectionFilter>): Promise<void> => {
    const filter = this.activeFilter;
    filter.resetFilter();
    filter.selectedCollectionNode = collectionNode;
    this.applyVaultFilter(filter);
  };

  addFolder = async (): Promise<void> => {
    this.onAddFolder.emit();
  };

  editFolder = async (folder: FolderFilter): Promise<void> => {
    this.onEditFolder.emit(folder);
  };

  async getDefaultFilter(): Promise<TreeNode<VaultFilterType>> {
    return await firstValueFrom(this.filters?.typeFilter.data$);
  }

  protected async removeInvalidFolderSelection(folders: FolderView[]) {
    if (this.activeFilter.selectedFolderNode) {
      if (!folders.some((f) => f.id === this.activeFilter.folderId)) {
        const filter = this.activeFilter;
        filter.resetFilter();
        filter.selectedCipherTypeNode =
          (await this.getDefaultFilter()) as TreeNode<CipherTypeFilter>;
        this.applyVaultFilter(filter);
      }
    }
  }

  protected async removeInvalidCollectionSelection(collections: CollectionView[]) {
    if (this.activeFilter.selectedCollectionNode) {
      if (!collections.some((f) => f.id === this.activeFilter.collectionId)) {
        const filter = this.activeFilter;
        filter.resetFilter();
        filter.selectedCipherTypeNode =
          (await this.getDefaultFilter()) as TreeNode<CipherTypeFilter>;
        this.applyVaultFilter(filter);
      }
    }
  }

  async buildAllFilters(): Promise<VaultFilterList> {
    const builderFilter = {} as VaultFilterList;
    builderFilter.organizationFilter = await this.addOrganizationFilter();
    builderFilter.typeFilter = await this.addTypeFilter();
    builderFilter.folderFilter = await this.addFolderFilter();
    builderFilter.collectionFilter = await this.addCollectionFilter();
    builderFilter.trashFilter = await this.addTrashFilter();
    return builderFilter;
  }

  protected async addOrganizationFilter(): Promise<VaultFilterSection> {
    const singleOrgPolicy = await this.policyService.policyAppliesToUser(PolicyType.SingleOrg);
    const personalVaultPolicy = await this.policyService.policyAppliesToUser(
      PolicyType.PersonalOwnership
    );

    const addAction = !singleOrgPolicy
      ? { text: "newOrganization", route: "/create-organization" }
      : null;

    const orgFilterSection: VaultFilterSection = {
      data$: this.vaultFilterService.organizationTree$,
      header: {
        showHeader: !(singleOrgPolicy && personalVaultPolicy),
        isSelectable: true,
      },
      action: this.applyOrganizationFilter,
      options: { component: OrganizationOptionsComponent },
      add: addAction,
      divider: true,
    };

    return orgFilterSection;
  }

  protected async addTypeFilter(excludeTypes: CipherStatus[] = []): Promise<VaultFilterSection> {
    const allTypeFilters: CipherTypeFilter[] = [
      {
        id: "favorites",
        name: this.i18nService.t("favorites"),
        type: "favorites",
        icon: "bwi-star",
      },
      {
        id: "login",
        name: this.i18nService.t("typeLogin"),
        type: CipherType.Login,
        icon: "bwi-globe",
      },
      {
        id: "card",
        name: this.i18nService.t("typeCard"),
        type: CipherType.Card,
        icon: "bwi-credit-card",
      },
      {
        id: "identity",
        name: this.i18nService.t("typeIdentity"),
        type: CipherType.Identity,
        icon: "bwi-id-card",
      },
      {
        id: "note",
        name: this.i18nService.t("typeSecureNote"),
        type: CipherType.SecureNote,
        icon: "bwi-sticky-note",
      },
    ];

    const typeFilterSection: VaultFilterSection = {
      data$: this.vaultFilterService.buildTypeTree(
        { id: "AllItems", name: "allItems", type: "all", icon: "" },
        allTypeFilters.filter((f) => !excludeTypes.includes(f.type))
      ),
      header: {
        showHeader: true,
        isSelectable: true,
      },
      action: this.applyTypeFilter,
    };
    return typeFilterSection;
  }

  protected async addFolderFilter(): Promise<VaultFilterSection> {
    const folderFilterSection: VaultFilterSection = {
      data$: this.vaultFilterService.folderTree$,
      header: {
        showHeader: true,
        isSelectable: false,
      },
      action: this.applyFolderFilter,
      edit: {
        text: "editFolder",
        action: this.editFolder,
      },
      add: {
        text: "Add Folder",
        action: this.addFolder,
      },
    };
    return folderFilterSection;
  }

  protected async addCollectionFilter(): Promise<VaultFilterSection> {
    const collectionFilterSection: VaultFilterSection = {
      data$: this.vaultFilterService.collectionTree$,
      header: {
        showHeader: true,
        isSelectable: true,
      },
      action: this.applyCollectionFilter,
    };
    return collectionFilterSection;
  }

  protected async addTrashFilter(): Promise<VaultFilterSection> {
    const trashFilterSection: VaultFilterSection = {
      data$: this.vaultFilterService.buildTypeTree(
        {
          id: "headTrash",
          name: "HeadTrash",
          type: "trash",
          icon: "bwi-trash",
        },
        [
          {
            id: "trash",
            name: this.i18nService.t("trash"),
            type: "trash",
            icon: "bwi-trash",
          },
        ]
      ),
      header: {
        showHeader: false,
        isSelectable: true,
      },
      action: this.applyTypeFilter,
    };
    return trashFilterSection;
  }
}
