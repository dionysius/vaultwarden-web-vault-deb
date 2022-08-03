import { Component } from "@angular/core";
import { Params } from "@angular/router";

import { BaseAcceptComponent } from "../../common/base.accept.component";

@Component({
  selector: "app-accept-family-sponsorship",
  templateUrl: "accept-family-sponsorship.component.html",
})
export class AcceptFamilySponsorshipComponent extends BaseAcceptComponent {
  failedShortMessage = "inviteAcceptFailedShort";
  failedMessage = "inviteAcceptFailed";

  requiredParameters = ["email", "token"];

  async authedHandler(qParams: Params) {
    this.router.navigate(["/setup/families-for-enterprise"], { queryParams: qParams });
  }

  async unauthedHandler(qParams: Params) {
    if (!qParams.register) {
      this.router.navigate(["/login"], { queryParams: { email: qParams.email } });
    } else {
      this.router.navigate(["/register"], { queryParams: { email: qParams.email } });
    }
  }
}
