import { Directive, HostListener, Input } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Directive({
  selector: "[appCopyClick]",
})
export class CopyClickDirective {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  @Input("appCopyClick") valueToCopy = "";

  @HostListener("click") onClick() {
    this.platformUtilsService.copyToClipboard(this.valueToCopy);
  }
}
