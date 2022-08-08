import { Component } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";

import { VaultFilterComponent as BaseVaultFilterComponent } from "../../../vault/vault-filter/vault-filter.component";

@Component({
  selector: "app-organization-vault-filter",
  templateUrl: "../../../vault/vault-filter/vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent {
  hideOrganizations = true;
  hideFavorites = true;
  hideFolders = true;

  organization: Organization;

  async initCollections() {
    if (this.organization.canEditAnyCollection) {
      return await this.vaultFilterService.buildAdminCollections(this.organization.id);
    }
    return await this.vaultFilterService.buildCollections(this.organization.id);
  }

  async reloadCollectionsAndFolders() {
    this.collections = await this.initCollections();
  }
}
