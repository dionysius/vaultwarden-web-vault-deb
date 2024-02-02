import { Component } from "@angular/core";

import { BrowserApi } from "../../platform/browser/browser-api";

@Component({
  selector: "app-help-and-feedback",
  templateUrl: "help-and-feedback.component.html",
})
export class HelpAndFeedbackComponent {
  launchHelp() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab("https://bitwarden.com/help/");
  }
  launchContactForm() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab("https://bitwarden.com/contact/");
  }

  launchForums() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab("https://bitwarden.com/getinvolved/");
  }
}
