import { Directive, HostListener, Input } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";

@Directive({
  selector: "[appLaunchClick]",
})
export class LaunchClickDirective {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  @Input("appLaunchClick") uriToLaunch = "";

  @HostListener("click") onClick() {
    if (!Utils.isNullOrWhitespace(this.uriToLaunch)) {
      this.platformUtilsService.launchUri(this.uriToLaunch);
    }
  }
}
