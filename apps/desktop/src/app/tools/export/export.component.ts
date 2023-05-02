import * as os from "os";

import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

import { DialogServiceAbstraction, SimpleDialogType } from "@bitwarden/angular/services/dialog";
import { ExportComponent as BaseExportComponent } from "@bitwarden/angular/tools/export/components/export.component";
import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { VaultExportServiceAbstraction } from "@bitwarden/exporter/vault-export";

const BroadcasterSubscriptionId = "ExportComponent";

@Component({
  selector: "app-export",
  templateUrl: "export.component.html",
})
export class ExportComponent extends BaseExportComponent implements OnInit {
  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    exportService: VaultExportServiceAbstraction,
    eventCollectionService: EventCollectionService,
    policyService: PolicyService,
    userVerificationService: UserVerificationService,
    formBuilder: UntypedFormBuilder,
    private broadcasterService: BroadcasterService,
    logService: LogService,
    fileDownloadService: FileDownloadService,
    dialogService: DialogServiceAbstraction
  ) {
    super(
      cryptoService,
      i18nService,
      platformUtilsService,
      exportService,
      eventCollectionService,
      policyService,
      window,
      logService,
      userVerificationService,
      formBuilder,
      fileDownloadService,
      dialogService
    );
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async warningDialog() {
    if (this.encryptedFormat) {
      return await this.dialogService.openSimpleDialog({
        title: { key: "confirmVaultExport" },
        content:
          this.i18nService.t("encExportKeyWarningDesc") +
          os.EOL +
          os.EOL +
          this.i18nService.t("encExportAccountWarningDesc"),
        acceptButtonText: { key: "exportVault" },
        type: SimpleDialogType.WARNING,
      });
    } else {
      return await this.dialogService.openSimpleDialog({
        title: { key: "confirmVaultExport" },
        content: { key: "exportWarningDesc" },
        acceptButtonText: { key: "exportVault" },
        type: SimpleDialogType.WARNING,
      });
    }
  }
}
