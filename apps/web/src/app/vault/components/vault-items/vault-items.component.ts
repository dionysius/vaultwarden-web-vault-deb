import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";
import { TableDataSource } from "@bitwarden/components";

import { GroupView } from "../../../admin-console/organizations/core";
import { Unassigned } from "../../individual-vault/vault-filter/shared/models/routed-vault-filter.model";

import { VaultItem } from "./vault-item";
import { VaultItemEvent } from "./vault-item-event";

// Fixed manual row height required due to how cdk-virtual-scroll works
export const RowHeight = 65;
export const RowHeightClass = `tw-h-[65px]`;

const MaxSelectionCount = 500;

@Component({
  selector: "app-vault-items",
  templateUrl: "vault-items.component.html",
  // TODO: Improve change detection, see: https://bitwarden.atlassian.net/browse/TDL-220
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultItemsComponent {
  protected RowHeight = RowHeight;

  @Input() disabled: boolean;
  @Input() showOwner: boolean;
  @Input() showCollections: boolean;
  @Input() showGroups: boolean;
  @Input() useEvents: boolean;
  @Input() showPremiumFeatures: boolean;
  @Input() showBulkMove: boolean;
  @Input() showBulkTrashOptions: boolean;
  // Encompasses functionality only available from the organization vault context
  @Input() showAdminActions = false;
  @Input() allOrganizations: Organization[] = [];
  @Input() allCollections: CollectionView[] = [];
  @Input() allGroups: GroupView[] = [];
  @Input() showBulkEditCollectionAccess = false;
  @Input() showBulkAddToCollections = false;
  @Input() showPermissionsColumn = false;
  @Input() viewingOrgVault: boolean;
  @Input({ required: true }) flexibleCollectionsV1Enabled = false;
  @Input() addAccessStatus: number;
  @Input() addAccessToggle: boolean;
  @Input() restrictProviderAccess: boolean;

  private _ciphers?: CipherView[] = [];
  @Input() get ciphers(): CipherView[] {
    return this._ciphers;
  }
  set ciphers(value: CipherView[] | undefined) {
    this._ciphers = value ?? [];
    this.refreshItems();
  }

  private _collections?: CollectionView[] = [];
  @Input() get collections(): CollectionView[] {
    return this._collections;
  }
  set collections(value: CollectionView[] | undefined) {
    this._collections = value ?? [];
    this.refreshItems();
  }

  @Output() onEvent = new EventEmitter<VaultItemEvent>();

  protected editableItems: VaultItem[] = [];
  protected dataSource = new TableDataSource<VaultItem>();
  protected selection = new SelectionModel<VaultItem>(true, [], true);

  get showExtraColumn() {
    return this.showCollections || this.showGroups || this.showOwner;
  }

  get isAllSelected() {
    return this.editableItems
      .slice(0, MaxSelectionCount)
      .every((item) => this.selection.isSelected(item));
  }

  get isEmpty() {
    return this.dataSource.data.length === 0;
  }

  get bulkMoveAllowed() {
    return (
      this.showBulkMove && this.selection.selected.filter((item) => item.collection).length === 0
    );
  }

  get bulkAssignToCollectionsAllowed() {
    return this.showBulkAddToCollections && this.ciphers.length > 0;
  }

  protected canEditCollection(collection: CollectionView): boolean {
    // Only allow allow deletion if collection editing is enabled and not deleting "Unassigned"
    if (collection.id === Unassigned) {
      return false;
    }

    const organization = this.allOrganizations.find((o) => o.id === collection.organizationId);

    return collection.canEdit(organization, this.flexibleCollectionsV1Enabled);
  }

  protected canDeleteCollection(collection: CollectionView): boolean {
    // Only allow allow deletion if collection editing is enabled and not deleting "Unassigned"
    if (collection.id === Unassigned) {
      return false;
    }

    const organization = this.allOrganizations.find((o) => o.id === collection.organizationId);

    return collection.canDelete(organization, this.flexibleCollectionsV1Enabled);
  }

  protected canViewCollectionInfo(collection: CollectionView) {
    const organization = this.allOrganizations.find((o) => o.id === collection.organizationId);
    return collection.canViewCollectionInfo(organization, this.flexibleCollectionsV1Enabled);
  }

  protected toggleAll() {
    this.isAllSelected
      ? this.selection.clear()
      : this.selection.select(...this.editableItems.slice(0, MaxSelectionCount));
  }

  protected event(event: VaultItemEvent) {
    this.onEvent.emit(event);
  }

  protected bulkMoveToFolder() {
    this.event({
      type: "moveToFolder",
      items: this.selection.selected
        .filter((item) => item.cipher !== undefined)
        .map((item) => item.cipher),
    });
  }

  protected bulkMoveToOrganization() {
    this.event({
      type: "moveToOrganization",
      items: this.selection.selected
        .filter((item) => item.cipher !== undefined)
        .map((item) => item.cipher),
    });
  }

  protected bulkRestore() {
    this.event({
      type: "restore",
      items: this.selection.selected
        .filter((item) => item.cipher !== undefined)
        .map((item) => item.cipher),
    });
  }

  protected bulkDelete() {
    this.event({
      type: "delete",
      items: this.selection.selected,
    });
  }

  protected canClone(vaultItem: VaultItem) {
    if (vaultItem.cipher.organizationId == null) {
      return true;
    }

    const org = this.allOrganizations.find((o) => o.id === vaultItem.cipher.organizationId);

    // Admins and custom users can always clone in the Org Vault
    if (this.viewingOrgVault && (org.isAdmin || org.permissions.editAnyCollection)) {
      return true;
    }

    // Check if the cipher belongs to a collection with canManage permission
    const orgCollections = this.allCollections.filter((c) => c.organizationId === org.id);

    for (const collection of orgCollections) {
      if (vaultItem.cipher.collectionIds.includes(collection.id) && collection.manage) {
        return true;
      }
    }

    return false;
  }

  private refreshItems() {
    const collections: VaultItem[] = this.collections.map((collection) => ({ collection }));
    const ciphers: VaultItem[] = this.ciphers.map((cipher) => ({ cipher }));
    const items: VaultItem[] = [].concat(collections).concat(ciphers);

    this.selection.clear();

    if (this.flexibleCollectionsV1Enabled) {
      // Every item except for the Unassigned collection is selectable, individual bulk actions check the user's permission
      this.editableItems = items.filter(
        (item) =>
          item.cipher !== undefined ||
          (item.collection !== undefined && item.collection.id !== Unassigned),
      );
    } else {
      // only collections the user can delete are selectable
      this.editableItems = items.filter(
        (item) =>
          item.cipher !== undefined ||
          (item.collection !== undefined && this.canDeleteCollection(item.collection)),
      );
    }

    this.dataSource.data = items;
  }

  protected bulkEditCollectionAccess() {
    this.event({
      type: "bulkEditCollectionAccess",
      items: this.selection.selected
        .filter((item) => item.collection !== undefined)
        .map((item) => item.collection),
    });
  }

  protected assignToCollections() {
    this.event({
      type: "assignToCollections",
      items: this.selection.selected
        .filter((item) => item.cipher !== undefined)
        .map((item) => item.cipher),
    });
  }
}
