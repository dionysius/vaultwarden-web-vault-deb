import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationVerifyDeleteRecoverRequest } from "@bitwarden/common/admin-console/models/request/organization-verify-delete-recover.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { SharedModule } from "../../../shared/shared.module";

@Component({
  templateUrl: "verify-recover-delete-org.component.html",
  standalone: true,
  imports: [SharedModule],
})
export class VerifyRecoverDeleteOrgComponent implements OnInit {
  loading = true;
  name: string;

  private orgId: string;
  private token: string;

  constructor(
    private router: Router,
    private apiService: OrganizationApiServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    const qParams = await firstValueFrom(this.route.queryParams);
    if (qParams.orgId != null && qParams.token != null && qParams.name != null) {
      this.orgId = qParams.orgId;
      this.token = qParams.token;
      this.name = qParams.name;
      this.loading = false;
    } else {
      await this.router.navigate(["/"]);
    }
  }

  submit = async () => {
    const request = new OrganizationVerifyDeleteRecoverRequest(this.token);
    await this.apiService.deleteUsingToken(this.orgId, request);
    this.platformUtilsService.showToast(
      "success",
      this.i18nService.t("organizationDeleted"),
      this.i18nService.t("organizationDeletedDesc"),
    );
    await this.router.navigate(["/"]);
  };
}
