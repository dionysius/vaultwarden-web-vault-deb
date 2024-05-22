import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { CollectionAccessDetailsResponse } from "@bitwarden/common/src/vault/models/response/collection.response";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

import { CollectionAccessSelectionView } from "../../../admin-console/organizations/core/views/collection-access-selection.view";
import { Unassigned } from "../../individual-vault/vault-filter/shared/models/routed-vault-filter.model";

export class CollectionAdminView extends CollectionView {
  groups: CollectionAccessSelectionView[] = [];
  users: CollectionAccessSelectionView[] = [];

  /**
   * Flag indicating the collection has no active user or group assigned to it with CanManage permissions
   * In this case, the collection can be managed by admins/owners or custom users with appropriate permissions
   */
  unmanaged: boolean;

  /**
   * Flag indicating the user has been explicitly assigned to this Collection
   */
  assigned: boolean;

  constructor(response?: CollectionAccessDetailsResponse) {
    super(response);

    if (!response) {
      return;
    }

    this.groups = response.groups
      ? response.groups.map((g) => new CollectionAccessSelectionView(g))
      : [];

    this.users = response.users
      ? response.users.map((g) => new CollectionAccessSelectionView(g))
      : [];

    this.assigned = response.assigned;
  }

  /**
   * Returns true if the user can edit a collection (including user and group access) from the Admin Console.
   */
  override canEdit(org: Organization, flexibleCollectionsV1Enabled: boolean): boolean {
    return (
      org?.canEditAnyCollection(flexibleCollectionsV1Enabled) ||
      (flexibleCollectionsV1Enabled && this.unmanaged && org?.canEditUnmanagedCollections()) ||
      super.canEdit(org, flexibleCollectionsV1Enabled)
    );
  }

  /**
   * Returns true if the user can delete a collection from the Admin Console.
   */
  override canDelete(org: Organization, flexibleCollectionsV1Enabled: boolean): boolean {
    return (
      org?.canDeleteAnyCollection(flexibleCollectionsV1Enabled) ||
      super.canDelete(org, flexibleCollectionsV1Enabled)
    );
  }

  /**
   * Whether the user can modify user access to this collection
   */
  canEditUserAccess(org: Organization, flexibleCollectionsV1Enabled: boolean): boolean {
    const allowAdminAccessToAllCollectionItems =
      !flexibleCollectionsV1Enabled || org.allowAdminAccessToAllCollectionItems;

    return (
      (org.permissions.manageUsers && allowAdminAccessToAllCollectionItems) ||
      this.canEdit(org, flexibleCollectionsV1Enabled)
    );
  }

  /**
   * Whether the user can modify group access to this collection
   */
  canEditGroupAccess(org: Organization, flexibleCollectionsV1Enabled: boolean): boolean {
    const allowAdminAccessToAllCollectionItems =
      !flexibleCollectionsV1Enabled || org.allowAdminAccessToAllCollectionItems;

    return (
      (org.permissions.manageGroups && allowAdminAccessToAllCollectionItems) ||
      this.canEdit(org, flexibleCollectionsV1Enabled)
    );
  }

  /**
   * Returns true if the user can view collection info and access in a read-only state from the Admin Console
   */
  override canViewCollectionInfo(
    org: Organization | undefined,
    flexibleCollectionsV1Enabled: boolean,
  ): boolean {
    if (!flexibleCollectionsV1Enabled) {
      return false;
    }

    if (this.isUnassignedCollection) {
      return false;
    }

    return this.manage || org?.isAdmin || org?.permissions.editAnyCollection;
  }

  /**
   * True if this collection represents the pseudo "Unassigned" collection
   * This is different from the "unmanaged" flag, which indicates that no users or groups have access to the collection
   */
  get isUnassignedCollection() {
    return this.id === Unassigned;
  }
}
