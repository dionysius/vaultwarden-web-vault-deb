import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { DialogServiceAbstraction, SimpleDialogType } from "@bitwarden/angular/services/dialog";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { ImportServiceAbstraction } from "@bitwarden/importer";

import { ImportComponent } from "../../../../tools/import-export/import.component";

@Component({
  selector: "app-org-import",
  templateUrl: "../../../../tools/import-export/import.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class OrganizationImportComponent extends ImportComponent {
  organizationName: string;

  constructor(
    i18nService: I18nService,
    importService: ImportServiceAbstraction,
    router: Router,
    private route: ActivatedRoute,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    private organizationService: OrganizationService,
    logService: LogService,
    modalService: ModalService,
    syncService: SyncService,
    dialogService: DialogServiceAbstraction
  ) {
    super(
      i18nService,
      importService,
      router,
      platformUtilsService,
      policyService,
      logService,
      modalService,
      syncService,
      dialogService
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
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "warning" },
      content: { key: "importWarning", placeholders: [this.organizationName] },
      type: SimpleDialogType.WARNING,
    });

    if (!confirmed) {
      return;
    }
    super.submit();
  }
}
