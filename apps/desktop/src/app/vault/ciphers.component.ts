import { Component } from "@angular/core";

import { CiphersComponent as BaseCiphersComponent } from "@bitwarden/angular/components/ciphers.component";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { CipherView } from "@bitwarden/common/models/view/cipherView";

import { SearchBarService } from "../layout/search/search-bar.service";

@Component({
  selector: "app-vault-ciphers",
  templateUrl: "ciphers.component.html",
})
export class CiphersComponent extends BaseCiphersComponent {
  constructor(searchService: SearchService, searchBarService: SearchBarService) {
    super(searchService);

    searchBarService.searchText$.subscribe((searchText) => {
      this.searchText = searchText;
      this.search(200);
    });
  }

  trackByFn(index: number, c: CipherView) {
    return c.id;
  }
}
