import { Observable } from "rxjs";

import { Organization } from "@bitwarden/common/models/domain/organization";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";

import { DynamicTreeNode } from "../vault-filter/models/dynamic-tree-node.model";

/**
 * @deprecated August 30 2022: Use new VaultFilterService with observables
 */
export abstract class DeprecatedVaultFilterService {
  buildOrganizations: () => Promise<Organization[]>;
  buildNestedFolders: (organizationId?: string) => Observable<DynamicTreeNode<FolderView>>;
  buildCollections: (organizationId?: string) => Promise<DynamicTreeNode<CollectionView>>;
  buildCollapsedFilterNodes: () => Promise<Set<string>>;
  storeCollapsedFilterNodes: (collapsedFilterNodes: Set<string>) => Promise<void>;
  checkForSingleOrganizationPolicy: () => Promise<boolean>;
  checkForPersonalOwnershipPolicy: () => Promise<boolean>;
}
