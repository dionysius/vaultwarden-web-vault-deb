import { Component } from "@angular/core";
import { Params } from "@angular/router";

import { BaseAcceptComponent } from "../../../common/base.accept.component";

@Component({
  selector: "app-accept-family-sponsorship",
  templateUrl: "accept-family-sponsorship.component.html",
})
export class AcceptFamilySponsorshipComponent extends BaseAcceptComponent {
  failedShortMessage = "inviteAcceptFailedShort";
  failedMessage = "inviteAcceptFailed";

  requiredParameters = ["email", "token"];

  async authedHandler(qParams: Params) {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate(["/setup/families-for-enterprise"], { queryParams: qParams });
  }

  async unauthedHandler(qParams: Params) {
    if (!qParams.register) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["/login"], { queryParams: { email: qParams.email } });
    } else {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["/register"], { queryParams: { email: qParams.email } });
    }
  }
}
