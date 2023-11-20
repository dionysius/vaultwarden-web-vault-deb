import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { RegionDomain } from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
})
export class EnvironmentSelectorComponent implements OnInit {
  constructor(private platformUtilsService: PlatformUtilsService, private router: Router) {}

  isEuServer: boolean;
  isUsServer: boolean;
  showRegionSelector = false;
  routeAndParams: string;

  async ngOnInit() {
    const domain = Utils.getDomain(window.location.href);
    this.isEuServer = domain.includes(RegionDomain.EU);
    this.isUsServer = domain.includes(RegionDomain.US) || domain.includes(RegionDomain.USQA);
    this.showRegionSelector = !this.platformUtilsService.isSelfHost();
    this.routeAndParams = `/#${this.router.url}`;
  }
}
