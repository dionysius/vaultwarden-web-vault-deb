import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { ImportService } from "@bitwarden/common/abstractions/import.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";

import { ImportComponent } from "../../../tools/import-export/import.component";

@Component({
  selector: "app-org-import",
  templateUrl: "../../../tools/import-export/import.component.html",
})
export class OrganizationImportComponent extends ImportComponent {
  organizationName: string;

  constructor(
    i18nService: I18nService,
    importService: ImportService,
    router: Router,
    private route: ActivatedRoute,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    private organizationService: OrganizationService,
    logService: LogService
  ) {
    super(i18nService, importService, router, platformUtilsService, policyService, logService);
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      this.successNavigate = ["organizations", this.organizationId, "vault"];
      await super.ngOnInit();
      this.importBlockedByPolicy = false;
    });
    const organization = await this.organizationService.get(this.organizationId);
    this.organizationName = organization.name;
  }

  async submit() {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("importWarning", this.organizationName),
      this.i18nService.t("warning"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return;
    }
    super.submit();
  }
}
