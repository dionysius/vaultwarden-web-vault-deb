import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, Observable } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";
import { AccountProfile } from "@bitwarden/common/models/domain/account";
import { WebI18nKey } from "@bitwarden/web-vault/app/core/web-i18n.service.implementation";

@Component({
  selector: "sm-header",
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  @Input() title: string;
  @Input() searchTitle: string;

  protected routeData$: Observable<{ title: WebI18nKey; searchTitle: WebI18nKey }>;
  protected account$: Observable<AccountProfile>;

  constructor(private route: ActivatedRoute, private stateService: StateService) {
    this.routeData$ = this.route.data.pipe(
      map((params) => {
        return {
          title: params.title,
          searchTitle: params.searchTitle,
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
