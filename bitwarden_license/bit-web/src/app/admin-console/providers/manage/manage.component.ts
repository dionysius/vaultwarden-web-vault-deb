import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { Provider } from "@bitwarden/common/admin-console/models/domain/provider";

@Component({
  selector: "provider-manage",
  templateUrl: "manage.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class ManageComponent implements OnInit {
  provider: Provider;
  accessEvents = false;

  constructor(
    private route: ActivatedRoute,
    private providerService: ProviderService,
  ) {}

  ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.params.subscribe(async (params) => {
      this.provider = await this.providerService.get(params.providerId);
      this.accessEvents = this.provider.useEvents;
    });
  }
}
