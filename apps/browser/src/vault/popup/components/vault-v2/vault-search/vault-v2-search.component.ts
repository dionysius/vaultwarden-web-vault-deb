import { CommonModule } from "@angular/common";
import { Component, Output, EventEmitter } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Subject, debounceTime } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SearchModule } from "@bitwarden/components";

const SearchTextDebounceInterval = 200;

@Component({
  imports: [CommonModule, SearchModule, JslibModule, FormsModule],
  standalone: true,
  selector: "app-vault-v2-search",
  templateUrl: "vault-v2-search.component.html",
})
export class VaultV2SearchComponent {
  searchText: string;
  @Output() searchTextChanged = new EventEmitter<string>();

  private searchText$ = new Subject<string>();

  constructor() {
    this.searchText$
      .pipe(debounceTime(SearchTextDebounceInterval), takeUntilDestroyed())
      .subscribe((data) => {
        this.searchTextChanged.emit(data);
      });
  }

  onSearchTextChanged() {
    this.searchText$.next(this.searchText);
  }
}
