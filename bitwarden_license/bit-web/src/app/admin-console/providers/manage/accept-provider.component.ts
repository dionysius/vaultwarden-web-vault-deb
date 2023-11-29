import { Component } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ProviderUserAcceptRequest } from "@bitwarden/common/admin-console/models/request/provider/provider-user-accept.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { BaseAcceptComponent } from "@bitwarden/web-vault/app/common/base.accept.component";

@Component({
  selector: "app-accept-provider",
  templateUrl: "accept-provider.component.html",
})
export class AcceptProviderComponent extends BaseAcceptComponent {
  providerName: string;

  failedMessage = "providerInviteAcceptFailed";

  requiredParameters = ["providerId", "providerUserId", "token"];

  constructor(
    router: Router,
    i18nService: I18nService,
    route: ActivatedRoute,
    stateService: StateService,
    private apiService: ApiService,
    platformUtilService: PlatformUtilsService,
  ) {
    super(router, platformUtilService, i18nService, route, stateService);
  }

  async authedHandler(qParams: Params) {
    const request = new ProviderUserAcceptRequest();
    request.token = qParams.token;

    await this.apiService.postProviderUserAccept(
      qParams.providerId,
      qParams.providerUserId,
      request,
    );
    this.platformUtilService.showToast(
      "success",
      this.i18nService.t("inviteAccepted"),
      this.i18nService.t("providerInviteAcceptedDesc"),
      { timeout: 10000 },
    );
    this.router.navigate(["/vault"]);
  }

  async unauthedHandler(qParams: Params) {
    this.providerName = qParams.providerName;
  }
}
