import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, Observable } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";
import { AccountProfile } from "@bitwarden/common/models/domain/account";

@Component({
  selector: "sm-header",
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  /**
   * Custom title that overrides the route data `titleId`
   */
  @Input() title: string;

  /**
   * Icon to show before the title
   */
  @Input() icon: string;

  protected routeData$: Observable<{ titleId: string }>;
  protected account$: Observable<AccountProfile>;

  constructor(private route: ActivatedRoute, private stateService: StateService) {
    this.routeData$ = this.route.data.pipe(
      map((params) => {
        return {
          titleId: params.titleId,
        };
      })
    );

    this.account$ = combineLatest([
      this.stateService.activeAccount$,
      this.stateService.accounts$,
    ]).pipe(
      map(([activeAccount, accounts]) => {
        return accounts[activeAccount]?.profile;
      })
    );
  }
}
