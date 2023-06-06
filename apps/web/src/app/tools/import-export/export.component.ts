import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ExportComponent as BaseExportComponent } from "@bitwarden/angular/tools/export/components/export.component";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { EncryptedExportType } from "@bitwarden/common/enums";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { FileDownloadService } from "@bitwarden/common/platform/abstractions/file-download/file-download.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { VaultExportServiceAbstraction } from "@bitwarden/exporter/vault-export";

import { UserVerificationPromptComponent } from "../../shared/components/user-verification";

@Component({
  selector: "app-export",
  templateUrl: "export.component.html",
})
export class ExportComponent extends BaseExportComponent {
  organizationId: string;
  encryptedExportType = EncryptedExportType;
  protected showFilePassword: boolean;

  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    exportService: VaultExportServiceAbstraction,
    eventCollectionService: EventCollectionService,
    policyService: PolicyService,
    logService: LogService,
    userVerificationService: UserVerificationService,
    formBuilder: UntypedFormBuilder,
    fileDownloadService: FileDownloadService,
    private modalService: ModalService,
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

  async submit() {
    if (this.isFileEncryptedExport && this.filePassword != this.confirmFilePassword) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("filePasswordAndConfirmFilePasswordDoNotMatch")
      );
      return;
    }

    this.exportForm.markAllAsTouched();
    if (!this.exportForm.valid) {
      return;
    }

    if (this.disabledByPolicy) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("personalVaultExportPolicyInEffect")
      );
      return;
    }

    const userVerified = await this.verifyUser();
    if (!userVerified) {
      return;
    }

    this.doExport();
  }

  protected saved() {
    super.saved();
    this.platformUtilsService.showToast("success", null, this.i18nService.t("exportSuccess"));
  }

  private verifyUser() {
    let confirmDescription = "exportWarningDesc";
    if (this.isFileEncryptedExport) {
      confirmDescription = "fileEncryptedExportWarningDesc";
    } else if (this.isAccountEncryptedExport) {
      confirmDescription = "encExportKeyWarningDesc";
    }

    const ref = this.modalService.open(UserVerificationPromptComponent, {
      allowMultipleModals: true,
      data: {
        confirmDescription: confirmDescription,
        confirmButtonText: "exportVault",
        modalTitle: "confirmVaultExport",
      },
    });

    if (ref == null) {
      return;
    }

    return ref.onClosedPromise();
  }

  get isFileEncryptedExport() {
    return (
      this.format === "encrypted_json" &&
      this.fileEncryptionType === EncryptedExportType.FileEncrypted
    );
  }

  get isAccountEncryptedExport() {
    return (
      this.format === "encrypted_json" &&
      this.fileEncryptionType === EncryptedExportType.AccountEncrypted
    );
  }
}
