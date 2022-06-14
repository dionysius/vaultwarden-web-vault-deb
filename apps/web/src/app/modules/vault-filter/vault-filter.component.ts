import { Component, EventEmitter, Output } from "@angular/core";

import { VaultFilterComponent as BaseVaultFilterComponent } from "@bitwarden/angular/modules/vault-filter/vault-filter.component";

import { VaultFilterService } from "./vault-filter.service";

@Component({
  selector: "app-vault-filter",
  templateUrl: "vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent {
  @Output() onSearchTextChanged = new EventEmitter<string>();

  searchPlaceholder: string;
  searchText = "";

  constructor(protected vaultFilterService: VaultFilterService) {
    // This empty constructor is required to provide the web vaultFilterService subclass to super()
    // TODO: refactor this to use proper dependency injection
    super(vaultFilterService);
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.vaultFilterService.collapsedFilterNodes$.subscribe((nodes) => {
      this.collapsedFilterNodes = nodes;
    });
  }

  searchTextChanged() {
    this.onSearchTextChanged.emit(this.searchText);
  }
}
