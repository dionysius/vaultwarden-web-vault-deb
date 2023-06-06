import { Component } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { EmergencyAccessAcceptRequest } from "@bitwarden/common/auth/models/request/emergency-access-accept.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

import { BaseAcceptComponent } from "../common/base.accept.component";

@Component({
  selector: "app-accept-emergency",
  templateUrl: "accept-emergency.component.html",
})
export class AcceptEmergencyComponent extends BaseAcceptComponent {
  name: string;

  protected requiredParameters: string[] = ["id", "name", "email", "token"];
  protected failedShortMessage = "emergencyInviteAcceptFailedShort";
  protected failedMessage = "emergencyInviteAcceptFailed";

  constructor(
    router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    route: ActivatedRoute,
    private apiService: ApiService,
    stateService: StateService
  ) {
    super(router, platformUtilsService, i18nService, route, stateService);
  }

  async authedHandler(qParams: Params): Promise<void> {
    const request = new EmergencyAccessAcceptRequest();
    request.token = qParams.token;
    this.actionPromise = this.apiService.postEmergencyAccessAccept(qParams.id, request);
    await this.actionPromise;
    await this.stateService.setEmergencyAccessInvitation(null);
    this.platformUtilService.showToast(
      "success",
      this.i18nService.t("inviteAccepted"),
      this.i18nService.t("emergencyInviteAcceptedDesc"),
      { timeout: 10000 }
    );
    this.router.navigate(["/vault"]);
  }

  async unauthedHandler(qParams: Params): Promise<void> {
    this.name = qParams.name;
    if (this.name != null) {
      // Fix URL encoding of space issue with Angular
      this.name = this.name.replace(/\+/g, " ");
    }

    // save the invitation to state so sso logins can find it later
    await this.stateService.setEmergencyAccessInvitation(qParams);
  }
}
