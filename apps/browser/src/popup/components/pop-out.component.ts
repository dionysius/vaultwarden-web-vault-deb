import { Component, Input, OnInit } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import BrowserPopupUtils from "../../platform/popup/browser-popup-utils";

@Component({
  selector: "app-pop-out",
  templateUrl: "pop-out.component.html",
})
export class PopOutComponent implements OnInit {
  @Input() show = true;

  constructor(private platformUtilsService: PlatformUtilsService) {}

  ngOnInit() {
    if (this.show) {
      if (
        (BrowserPopupUtils.inSidebar(window) && this.platformUtilsService.isFirefox()) ||
        BrowserPopupUtils.inPopout(window)
      ) {
        this.show = false;
      }
    }
  }

  expand() {
    BrowserPopupUtils.openCurrentPagePopout(window);
  }
}
