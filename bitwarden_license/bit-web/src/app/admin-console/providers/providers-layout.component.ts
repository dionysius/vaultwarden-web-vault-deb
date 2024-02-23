import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { Provider } from "@bitwarden/common/admin-console/models/domain/provider";
import { IconModule, LayoutComponent, NavigationModule } from "@bitwarden/components";
import { ProviderPortalLogo } from "@bitwarden/web-vault/app/admin-console/icons/provider-portal-logo";
import { PaymentMethodBannersComponent } from "@bitwarden/web-vault/app/components/payment-method-banners/payment-method-banners.component";

@Component({
  selector: "providers-layout",
  templateUrl: "providers-layout.component.html",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    JslibModule,
    LayoutComponent,
    IconModule,
    NavigationModule,
    PaymentMethodBannersComponent,
  ],
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class ProvidersLayoutComponent {
  protected readonly logo = ProviderPortalLogo;

  provider: Provider;
  private providerId: string;

  constructor(
    private route: ActivatedRoute,
    private providerService: ProviderService,
  ) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.params.subscribe(async (params) => {
      this.providerId = params.providerId;
      await this.load();
    });
  }

  async load() {
    this.provider = await this.providerService.get(this.providerId);
  }

  get showMenuBar() {
    return this.showManageTab || this.showSettingsTab;
  }

  get showManageTab() {
    return this.provider.canManageUsers || this.provider.canAccessEventLogs;
  }

  get showSettingsTab() {
    return this.provider.isProviderAdmin;
  }

  get manageRoute(): string {
    switch (true) {
      case this.provider.canManageUsers:
        return "manage/people";
      case this.provider.canAccessEventLogs:
        return "manage/events";
    }
  }
}
