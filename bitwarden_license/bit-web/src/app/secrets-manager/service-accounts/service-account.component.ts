import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { switchMap } from "rxjs";

import { ServiceAccountService } from "./service-account.service";

@Component({
  selector: "sm-service-account",
  templateUrl: "./service-account.component.html",
})
export class ServiceAccountComponent {
  /**
   * TODO: remove when a server method is available that fetches a service account by ID
   */
  protected serviceAccount$ = this.route.params.pipe(
    switchMap((params) =>
      this.serviceAccountService
        .getServiceAccounts(params.organizationId)
        .then((saList) => saList.find((sa) => sa.id === params.serviceAccountId))
    )
  );

  constructor(
    private route: ActivatedRoute,
    private serviceAccountService: ServiceAccountService
  ) {}
}
