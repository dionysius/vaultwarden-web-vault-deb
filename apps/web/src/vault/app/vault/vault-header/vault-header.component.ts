import { Component, EventEmitter, Input, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { TreeNode } from "@bitwarden/common/models/domain/tree-node";

import { VaultFilter } from "../vault-filter/shared/models/vault-filter.model";
import { CollectionFilter } from "../vault-filter/shared/models/vault-filter.type";

@Component({
  selector: "app-vault-header",
  templateUrl: "./vault-header.component.html",
})
export class VaultHeaderComponent {
  /**
   * Promise that is used to determine the loading state of the header via the ApiAction directive.
   * When the promise exists and is not resolved, the loading spinner will be shown.
   */
  @Input() actionPromise: Promise<any>;

  /**
   * The filter being actively applied to the vault view
   */
  @Input() activeFilter: VaultFilter;

  /**
   * Emits when the active filter has been modified by the header
   */
  @Output() activeFilterChanged = new EventEmitter<VaultFilter>();

  /**
   * Emits an event when the new item button is clicked in the header
   */
  @Output() onAddCipher = new EventEmitter<void>();

  organizations$ = this.organizationService.organizations$;

  constructor(private organizationService: OrganizationService, private i18nService: I18nService) {}

  /**
   * The id of the organization that is currently being filtered on.
   * This can come from a collection filter or organization filter, if applied.
   */
  get activeOrganizationId() {
    if (this.activeFilter.selectedCollectionNode != null) {
      return this.activeFilter.selectedCollectionNode.node.organizationId;
    }
    if (this.activeFilter.selectedOrganizationNode != null) {
      return this.activeFilter.selectedOrganizationNode.node.id;
    }
    return undefined;
  }

  get title() {
    if (this.activeFilter.isCollectionSelected) {
      if (this.activeFilter.isUnassignedCollectionSelected) {
        return this.i18nService.t("unassigned");
      }
      return this.activeFilter.selectedCollectionNode.node.name;
    }

    if (this.activeFilter.isMyVaultSelected) {
      return this.i18nService.t("myVault");
    }

    if (this.activeFilter?.selectedOrganizationNode != null) {
      return `${this.activeFilter.selectedOrganizationNode.node.name} ${this.i18nService
        .t("vault")
        .toLowerCase()}`;
    }

    return this.i18nService.t("allVaults");
  }

  applyCollectionFilter(collection: TreeNode<CollectionFilter>) {
    const filter = this.activeFilter;
    filter.resetFilter();
    filter.selectedCollectionNode = collection;
    this.activeFilterChanged.emit(filter);
  }

  addCipher() {
    this.onAddCipher.emit();
  }
}
