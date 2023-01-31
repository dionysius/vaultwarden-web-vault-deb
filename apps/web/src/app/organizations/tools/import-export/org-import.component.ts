import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { ImportService } from "@bitwarden/common/abstractions/import/import.service.abstraction";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { ImportComponent } from "../../../tools/import-export/import.component";

@Component({
  selector: "app-org-import",
  templateUrl: "../../../tools/import-export/import.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
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
    logService: LogService,
    modalService: ModalService,
    syncService: SyncService
  ) {
    super(
      i18nService,
      importService,
      router,
      platformUtilsService,
      policyService,
      logService,
      modalService,
      syncService
    );
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      this.successNavigate = ["organizations", this.organizationId, "vault"];
      await super.ngOnInit();
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
