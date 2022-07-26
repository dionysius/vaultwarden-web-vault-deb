import { Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";

import { StateService } from "@bitwarden/common/abstractions/state.service";

import { SearchBarService, SearchBarState } from "./search-bar.service";

@Component({
  selector: "app-search",
  templateUrl: "search.component.html",
})
export class SearchComponent implements OnInit, OnDestroy {
  state: SearchBarState;
  searchText: UntypedFormControl = new UntypedFormControl(null);

  constructor(private searchBarService: SearchBarService, private stateService: StateService) {
    this.searchBarService.state.subscribe((state) => {
      this.state = state;
    });

    this.searchText.valueChanges.subscribe((value) => {
      this.searchBarService.setSearchText(value);
    });
  }

  ngOnInit() {
    this.stateService.activeAccount.subscribe((value) => {
      this.searchBarService.setSearchText("");
      this.searchText.patchValue("");
    });
  }

  ngOnDestroy() {
    this.stateService.activeAccount.unsubscribe();
  }
}
