import { Component, EventEmitter, Output } from "@angular/core";

import { VaultFilterComponent as BaseVaultFilterComponent } from "@bitwarden/angular/vault/vault-filter/components/vault-filter.component";

import { VaultFilterService } from "./shared/vault-filter.service";

@Component({
  selector: "./app-vault-filter",
  templateUrl: "vault-filter.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
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
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil
    this.vaultFilterService.collapsedFilterNodes$.subscribe((nodes) => {
      this.collapsedFilterNodes = nodes;
    });
  }

  searchTextChanged() {
    this.onSearchTextChanged.emit(this.searchText);
  }
}
