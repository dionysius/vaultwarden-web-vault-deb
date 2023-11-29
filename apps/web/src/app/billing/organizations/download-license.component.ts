import { Component, EventEmitter, Input, Output } from "@angular/core";

import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { FileDownloadService } from "@bitwarden/common/platform/abstractions/file-download/file-download.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

@Component({
  selector: "app-download-license",
  templateUrl: "download-license.component.html",
})
export class DownloadLicenseComponent {
  @Input() organizationId: string;
  @Output() onDownloaded = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  installationId: string;
  formPromise: Promise<unknown>;

  constructor(
    private fileDownloadService: FileDownloadService,
    private logService: LogService,
    private organizationApiService: OrganizationApiServiceAbstraction,
  ) {}

  async submit() {
    if (this.installationId == null || this.installationId === "") {
      return;
    }

    try {
      this.formPromise = this.organizationApiService.getLicense(
        this.organizationId,
        this.installationId,
      );
      const license = await this.formPromise;
      const licenseString = JSON.stringify(license, null, 2);
      this.fileDownloadService.download({
        fileName: "bitwarden_organization_license.json",
        blobData: licenseString,
      });
      this.onDownloaded.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  cancel() {
    this.onCanceled.emit();
  }
}
