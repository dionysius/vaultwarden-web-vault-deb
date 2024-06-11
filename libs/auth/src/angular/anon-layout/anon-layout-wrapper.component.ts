import { Component } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";

import { AnonLayoutComponent } from "@bitwarden/auth/angular";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { Icon } from "@bitwarden/components";

export interface AnonLayoutWrapperData {
  pageTitle?: string;
  pageSubtitle?: string;
  pageIcon?: Icon;
  showReadonlyHostname?: boolean;
}

@Component({
  standalone: true,
  templateUrl: "anon-layout-wrapper.component.html",
  imports: [AnonLayoutComponent, RouterModule],
})
export class AnonLayoutWrapperComponent {
  protected pageTitle: string;
  protected pageSubtitle: string;
  protected pageIcon: Icon;
  protected showReadonlyHostname: boolean;

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
  ) {
    const routeData = this.route.snapshot.firstChild?.data;

    if (!routeData) {
      return;
    }

    if (routeData["pageTitle"] !== undefined) {
      this.pageTitle = this.i18nService.t(routeData["pageTitle"]);
    }

    if (routeData["pageSubtitle"] !== undefined) {
      this.pageSubtitle = this.i18nService.t(routeData["pageSubtitle"]);
    }

    this.pageIcon = routeData["pageIcon"];
    this.showReadonlyHostname = routeData["showReadonlyHostname"];
  }
}
