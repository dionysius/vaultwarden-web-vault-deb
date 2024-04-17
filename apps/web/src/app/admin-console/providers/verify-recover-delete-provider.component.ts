import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { ProviderApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/provider/provider-api.service.abstraction";
import { ProviderVerifyRecoverDeleteRequest } from "@bitwarden/common/admin-console/models/request/provider/provider-verify-recover-delete.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  selector: "app-verify-recover-delete-provider",
  templateUrl: "verify-recover-delete-provider.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class VerifyRecoverDeleteProviderComponent implements OnInit {
  name: string;
  formPromise: Promise<any>;

  private providerId: string;
  private token: string;

  constructor(
    private router: Router,
    private providerApiService: ProviderApiServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private route: ActivatedRoute,
    private logService: LogService,
  ) {}

  async ngOnInit() {
    const qParams = await firstValueFrom(this.route.queryParams);
    if (qParams.providerId != null && qParams.token != null && qParams.name != null) {
      this.providerId = qParams.providerId;
      this.token = qParams.token;
      this.name = qParams.name;
    } else {
      await this.router.navigate(["/"]);
    }
  }

  async submit() {
    try {
      const request = new ProviderVerifyRecoverDeleteRequest(this.token);
      this.formPromise = this.providerApiService.providerRecoverDeleteToken(
        this.providerId,
        request,
      );
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("providerDeleted"),
        this.i18nService.t("providerDeletedDesc"),
      );
      await this.router.navigate(["/"]);
    } catch (e) {
      this.logService.error(e);
    }
  }
}
