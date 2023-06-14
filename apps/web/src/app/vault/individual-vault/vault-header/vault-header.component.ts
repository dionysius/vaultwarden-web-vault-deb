import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

import {
  All,
  RoutedVaultFilterModel,
  Unassigned,
} from "../vault-filter/shared/models/routed-vault-filter.model";

@Component({
  selector: "app-vault-header",
  templateUrl: "./vault-header.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultHeaderComponent {
  protected Unassigned = Unassigned;
  protected All = All;

  /**
   * Boolean to determine the loading state of the header.
   * Shows a loading spinner if set to true
   */
  @Input() loading: boolean;

  /** Current active filter */
  @Input() filter: RoutedVaultFilterModel;

  /**
   * All organizations that can be shown
   */
  @Input() organizations: Organization[] = [];

  /**
   * Currently selected collection
   */
  @Input() collection?: TreeNode<CollectionView>;

  /**
   * Emits an event when the new item button is clicked in the header
   */
  @Output() onAddCipher = new EventEmitter<void>();

  constructor(private i18nService: I18nService) {}

  /**
   * The id of the organization that is currently being filtered on.
   * This can come from a collection filter or organization filter, if applied.
   */
  protected get activeOrganizationId() {
    if (this.collection != undefined) {
      return this.collection.node.organizationId;
    }

    if (this.filter.organizationId !== undefined) {
      return this.filter.organizationId;
    }

    return undefined;
  }

  protected get activeOrganization() {
    const organizationId = this.activeOrganizationId;
    return this.organizations?.find((org) => org.id === organizationId);
  }

  protected get showBreadcrumbs() {
    return this.filter.collectionId !== undefined && this.filter.collectionId !== All;
  }

  protected get title() {
    if (this.filter.collectionId === Unassigned) {
      return this.i18nService.t("unassigned");
    }

    if (this.collection) {
      return this.collection.node.name;
    }

    if (this.filter.organizationId === Unassigned) {
      return this.i18nService.t("myVault");
    }

    const activeOrganization = this.activeOrganization;
    if (activeOrganization) {
      return `${activeOrganization.name} ${this.i18nService.t("vault").toLowerCase()}`;
    }

    return this.i18nService.t("allVaults");
  }

  /**
   * A list of collection filters that form a chain from the organization root to currently selected collection.
   * Begins from the organization root and excludes the currently selected collection.
   */
  protected get collections() {
    if (this.collection == undefined) {
      return [];
    }

    const collections = [this.collection];
    while (collections[collections.length - 1].parent != undefined) {
      collections.push(collections[collections.length - 1].parent);
    }

    return collections
      .slice(1)
      .reverse()
      .map((treeNode) => treeNode.node);
  }

  protected addCipher() {
    this.onAddCipher.emit();
  }
}
