import { Component } from "@angular/core";
import { Params } from "@angular/router";

import { BaseAcceptComponent } from "@bitwarden/web-vault/app/common/base.accept.component";

@Component({
  selector: "app-setup-provider",
  templateUrl: "setup-provider.component.html",
})
export class SetupProviderComponent extends BaseAcceptComponent {
  failedShortMessage = "inviteAcceptFailedShort";
  failedMessage = "inviteAcceptFailed";

  requiredParameters = ["providerId", "email", "token"];

  async authedHandler(qParams: Params) {
    this.router.navigate(["/providers/setup"], { queryParams: qParams });
  }

  async unauthedHandler(qParams: Params) {
    // Empty
  }
}
