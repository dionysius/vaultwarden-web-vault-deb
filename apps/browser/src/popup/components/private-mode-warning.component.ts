import { Component, OnInit } from "@angular/core";

import { PopupUtilsService } from "../services/popup-utils.service";

@Component({
  selector: "app-private-mode-warning",
  templateUrl: "private-mode-warning.component.html",
})
export class PrivateModeWarningComponent implements OnInit {
  showWarning = false;

  constructor(private popupUtilsService: PopupUtilsService) {}

  ngOnInit() {
    this.showWarning = this.popupUtilsService.inPrivateMode();
  }
}
