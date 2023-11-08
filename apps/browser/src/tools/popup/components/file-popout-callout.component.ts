import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CalloutModule } from "@bitwarden/components";

import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";
import { FilePopoutUtilsService } from "../services/file-popout-utils.service";

@Component({
  selector: "tools-file-popout-callout",
  templateUrl: "file-popout-callout.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, CalloutModule],
})
export class FilePopoutCalloutComponent implements OnInit {
  protected showFilePopoutMessage: boolean;
  protected showFirefoxFileWarning: boolean;
  protected showSafariFileWarning: boolean;
  protected showChromiumFileWarning: boolean;

  constructor(private filePopoutUtilsService: FilePopoutUtilsService) {}

  ngOnInit() {
    this.showFilePopoutMessage = this.filePopoutUtilsService.showFilePopoutMessage(window);
    this.showFirefoxFileWarning = this.filePopoutUtilsService.showFirefoxFileWarning(window);
    this.showSafariFileWarning = this.filePopoutUtilsService.showSafariFileWarning(window);
    this.showChromiumFileWarning = this.filePopoutUtilsService.showChromiumFileWarning(window);
  }

  popOutWindow() {
    BrowserPopupUtils.openCurrentPagePopout(window);
  }
}
