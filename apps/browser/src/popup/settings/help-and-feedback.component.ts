import { Component } from "@angular/core";

import { BrowserApi } from "../../browser/browserApi";

@Component({
  selector: "app-help-and-feedback",
  templateUrl: "help-and-feedback.component.html",
})
export class HelpAndFeedbackComponent {
  launchHelp() {
    BrowserApi.createNewTab("https://bitwarden.com/help/");
  }
  launchContactForm() {
    BrowserApi.createNewTab("https://bitwarden.com/contact/");
  }

  launchForums() {
    BrowserApi.createNewTab("https://bitwarden.com/getinvolved/");
  }
}
