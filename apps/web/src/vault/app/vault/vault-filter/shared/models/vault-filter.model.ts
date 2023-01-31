import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import {
  CipherStatus,
  CipherTypeFilter,
  CollectionFilter,
  FolderFilter,
  OrganizationFilter,
} from "./vault-filter.type";

export type VaultFilterFunction = (cipher: CipherView) => boolean;

// TODO: Replace shared VaultFilter Model with this one and
// refactor browser and desktop code to use this model.
export class VaultFilter {
  selectedOrganizationNode: TreeNode<OrganizationFilter>;
  selectedCipherTypeNode: TreeNode<CipherTypeFilter>;
  selectedFolderNode: TreeNode<FolderFilter>;
  selectedCollectionNode: TreeNode<CollectionFilter>;

  get isFavorites(): boolean {
    return this.selectedCipherTypeNode?.node.type === "favorites";
  }

  get isDeleted(): boolean {
    return this.selectedCipherTypeNode?.node.type === "trash" ? true : null;
  }

  get organizationId(): string {
    return this.selectedOrganizationNode?.node.id;
  }

  get cipherType(): CipherType {
    return this.selectedCipherTypeNode?.node.type in CipherType
      ? (this.selectedCipherTypeNode?.node.type as CipherType)
      : null;
  }

  get cipherStatus(): CipherStatus {
    return this.selectedCipherTypeNode?.node.type;
  }

  get cipherTypeId(): string {
    return this.selectedCipherTypeNode?.node.id;
  }

  get folderId(): string {
    return this.selectedFolderNode?.node.id;
  }

  get collectionId(): string {
    return this.selectedCollectionNode?.node.id;
  }

  constructor(init?: Partial<VaultFilter>) {
    Object.assign(this, init);
  }

  resetFilter() {
    this.selectedCipherTypeNode = null;
    this.selectedFolderNode = null;
    this.selectedCollectionNode = null;
  }

  resetOrganization() {
    this.selectedOrganizationNode = null;
  }

  buildFilter(): VaultFilterFunction {
    return (cipher) => {
      let cipherPassesFilter = true;
      if (this.isFavorites && cipherPassesFilter) {
        cipherPassesFilter = cipher.favorite;
      }
      if (this.isDeleted && cipherPassesFilter) {
        cipherPassesFilter = cipher.isDeleted;
      }
      if (this.cipherType && cipherPassesFilter) {
        cipherPassesFilter = cipher.type === this.cipherType;
      }
      if (this.selectedFolderNode) {
        // No folder
        if (this.folderId === null && cipherPassesFilter) {
          cipherPassesFilter = cipher.folderId === null;
        }
        // Folder
        if (this.folderId !== null && cipherPassesFilter) {
          cipherPassesFilter = cipher.folderId === this.folderId;
        }
      }
      if (this.selectedCollectionNode) {
        // All Collections
        if (this.collectionId === "AllCollections" && cipherPassesFilter) {
          cipherPassesFilter = false;
        }
        // Unassigned
        if (this.collectionId === null && cipherPassesFilter) {
          cipherPassesFilter =
            cipher.organizationId != null &&
            (cipher.collectionIds == null || cipher.collectionIds.length === 0);
        }
        // Collection
        if (
          this.collectionId !== null &&
          this.collectionId !== "AllCollections" &&
          cipherPassesFilter
        ) {
          cipherPassesFilter =
            cipher.collectionIds != null && cipher.collectionIds.includes(this.collectionId);
        }
      }
      if (this.selectedOrganizationNode) {
        // My Vault
        if (this.organizationId === "MyVault" && cipherPassesFilter) {
          cipherPassesFilter = cipher.organizationId === null;
        }
        // Organization
        else if (this.organizationId !== null && cipherPassesFilter) {
          cipherPassesFilter = cipher.organizationId === this.organizationId;
        }
      }
      return cipherPassesFilter;
    };
  }
}
