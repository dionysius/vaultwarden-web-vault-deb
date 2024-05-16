import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { IconButtonModule } from "@bitwarden/components";

import BrowserPopupUtils from "../browser-popup-utils";

@Component({
  selector: "app-pop-out",
  templateUrl: "pop-out.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, IconButtonModule],
})
export class PopOutComponent implements OnInit {
  @Input() show = true;
  useRefreshVariant = false;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private configService: ConfigService,
  ) {}

  async ngOnInit() {
    this.useRefreshVariant = await this.configService.getFeatureFlag(FeatureFlag.ExtensionRefresh);

    if (this.show) {
      if (
        (BrowserPopupUtils.inSidebar(window) && this.platformUtilsService.isFirefox()) ||
        BrowserPopupUtils.inPopout(window)
      ) {
        this.show = false;
      }
    }
  }

  async expand() {
    await BrowserPopupUtils.openCurrentPagePopout(window);
  }
}
