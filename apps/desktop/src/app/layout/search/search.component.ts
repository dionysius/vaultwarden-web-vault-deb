import { Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { Subscription } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";

import { SearchBarService, SearchBarState } from "./search-bar.service";

@Component({
  selector: "app-search",
  templateUrl: "search.component.html",
})
export class SearchComponent implements OnInit, OnDestroy {
  state: SearchBarState;
  searchText: UntypedFormControl = new UntypedFormControl(null);

  private activeAccountSubscription: Subscription;

  constructor(private searchBarService: SearchBarService, private stateService: StateService) {
    this.searchBarService.state$.subscribe((state) => {
      this.state = state;
    });

    this.searchText.valueChanges.subscribe((value) => {
      this.searchBarService.setSearchText(value);
    });
  }

  ngOnInit() {
    this.activeAccountSubscription = this.stateService.activeAccount$.subscribe((value) => {
      this.searchBarService.setSearchText("");
      this.searchText.patchValue("");
    });
  }

  ngOnDestroy() {
    this.activeAccountSubscription.unsubscribe();
  }
}
