import { Component, OnInit } from "@angular/core";

import BrowserPopupUtils from "../platform/popup/browser-popup-utils";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.component.html",
})
export class TabsComponent implements OnInit {
  showCurrentTab = true;

  ngOnInit() {
    this.showCurrentTab = !BrowserPopupUtils.inPopout(window);
  }
}
