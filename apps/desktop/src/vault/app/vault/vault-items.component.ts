import { Component } from "@angular/core";

import { VaultItemsComponent as BaseVaultItemsComponent } from "@bitwarden/angular/vault/components/vault-items.component";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { SearchBarService } from "../../../app/layout/search/search-bar.service";

@Component({
  selector: "app-vault-items",
  templateUrl: "vault-items.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class VaultItemsComponent extends BaseVaultItemsComponent {
  constructor(searchService: SearchService, searchBarService: SearchBarService) {
    super(searchService);

    // eslint-disable-next-line rxjs-angular/prefer-takeuntil
    searchBarService.searchText$.subscribe((searchText) => {
      this.searchText = searchText;
      this.search(200);
    });
  }

  trackByFn(index: number, c: CipherView) {
    return c.id;
  }
}
