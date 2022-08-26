import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EventService } from "@bitwarden/common/abstractions/event.service";
import { ExportService } from "@bitwarden/common/abstractions/export.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { EventType } from "@bitwarden/common/enums/eventType";

import { ExportComponent } from "../../../tools/import-export/export.component";

@Component({
  selector: "app-org-export",
  templateUrl: "../../../tools/import-export/export.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class OrganizationExportComponent extends ExportComponent {
  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    exportService: ExportService,
    eventService: EventService,
    private route: ActivatedRoute,
    policyService: PolicyService,
    logService: LogService,
    userVerificationService: UserVerificationService,
    formBuilder: UntypedFormBuilder,
    fileDownloadService: FileDownloadService
  ) {
    super(
      cryptoService,
      i18nService,
      platformUtilsService,
      exportService,
      eventService,
      policyService,
      logService,
      userVerificationService,
      formBuilder,
      fileDownloadService
    );
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
    });
    await super.ngOnInit();
  }

  async checkExportDisabled() {
    return;
  }

  getExportData() {
    return this.exportService.getOrganizationExport(this.organizationId, this.format);
  }

  getFileName() {
    return super.getFileName("org");
  }

  async collectEvent(): Promise<void> {
    await this.eventService.collect(
      EventType.Organization_ClientExportedVault,
      null,
      null,
      this.organizationId
    );
  }
}
