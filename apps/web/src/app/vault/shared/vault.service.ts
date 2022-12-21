import { VaultFilter } from "@bitwarden/angular/vault/vault-filter/models/vault-filter.model";

import { WebI18nKey } from "../../core/web-i18n.service.implementation";

export class VaultService {
  calculateSearchBarLocalizationString(vaultFilter: VaultFilter): WebI18nKey {
    if (vaultFilter.status === "favorites") {
      return "searchFavorites";
    }
    if (vaultFilter.status === "trash") {
      return "searchTrash";
    }
    if (vaultFilter.cipherType != null) {
      return "searchType";
    }
    if (vaultFilter.selectedFolderId != null && vaultFilter.selectedFolderId != "none") {
      return "searchFolder";
    }
    if (vaultFilter.selectedCollection) {
      return "searchCollection";
    }
    if (vaultFilter.selectedOrganizationId != null) {
      return "searchOrganization";
    }
    if (vaultFilter.myVaultOnly) {
      return "searchMyVault";
    }

    return "searchVault";
  }
}
