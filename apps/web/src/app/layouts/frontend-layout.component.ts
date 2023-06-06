import { Component, OnDestroy, OnInit } from "@angular/core";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "app-frontend-layout",
  templateUrl: "frontend-layout.component.html",
})
export class FrontendLayoutComponent implements OnInit, OnDestroy {
  version: string;
  year = "2015";
  isEuServer = true;
  euServerFlagEnabled: boolean;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private configService: ConfigServiceAbstraction
  ) {}

  async ngOnInit() {
    this.year = new Date().getFullYear().toString();
    this.version = await this.platformUtilsService.getApplicationVersion();
    this.euServerFlagEnabled = await this.configService.getFeatureFlagBool(
      FeatureFlag.DisplayEuEnvironmentFlag
    );
    this.isEuServer = Utils.getDomain(window.location.href).includes(".eu");

    document.body.classList.add("layout_frontend");
  }

  ngOnDestroy() {
    document.body.classList.remove("layout_frontend");
  }
}
