import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";

@Component({
  selector: "app-download-license",
  templateUrl: "download-license.component.html",
})
export class DownloadLicenseComponent {
  @Input() organizationId: string;
  @Output() onDownloaded = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  installationId: string;
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private fileDownloadService: FileDownloadService,
    private logService: LogService
  ) {}

  async submit() {
    if (this.installationId == null || this.installationId === "") {
      return;
    }

    try {
      this.formPromise = this.apiService.getOrganizationLicense(
        this.organizationId,
        this.installationId
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
