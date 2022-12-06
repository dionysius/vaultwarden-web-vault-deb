import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
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
    eventCollectionService: EventCollectionService,
    private route: ActivatedRoute,
    policyService: PolicyService,
    logService: LogService,
    userVerificationService: UserVerificationService,
    formBuilder: UntypedFormBuilder,
    fileDownloadService: FileDownloadService,
    modalService: ModalService
  ) {
    super(
      cryptoService,
      i18nService,
      platformUtilsService,
      exportService,
      eventCollectionService,
      policyService,
      logService,
      userVerificationService,
      formBuilder,
      fileDownloadService,
      modalService
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
    if (this.isFileEncryptedExport) {
      return this.exportService.getPasswordProtectedExport(this.filePassword, this.organizationId);
    } else {
      return this.exportService.getOrganizationExport(this.organizationId, this.format);
    }
  }

  getFileName() {
    return super.getFileName("org");
  }

  async collectEvent(): Promise<void> {
    await this.eventCollectionService.collect(
      EventType.Organization_ClientExportedVault,
      null,
      null,
      this.organizationId
    );
  }
}
