import { Component, Input, OnInit } from "@angular/core";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { RegionDomain } from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
})
export class EnvironmentSelectorComponent implements OnInit {
  constructor(
    private configService: ConfigServiceAbstraction,
    private platformUtilsService: PlatformUtilsService
  ) {}
  @Input() hasFlags: boolean;
  isEuServer: boolean;
  isUsServer: boolean;
  showRegionSelector = false;
  euServerFlagEnabled: boolean;
  selectedRegionImageName: string;

  async ngOnInit() {
    this.euServerFlagEnabled = await this.configService.getFeatureFlagBool(
      FeatureFlag.DisplayEuEnvironmentFlag
    );
    const domain = Utils.getDomain(window.location.href);
    this.isEuServer = domain.includes(RegionDomain.EU);
    this.isUsServer = domain.includes(RegionDomain.US) || domain.includes(RegionDomain.USQA);
    this.selectedRegionImageName = this.getRegionImage();
    this.showRegionSelector = !this.platformUtilsService.isSelfHost();
  }

  getRegionImage(): string {
    if (this.isEuServer) {
      return "flag-eu";
    } else {
      return "flag-us";
    }
  }
}
