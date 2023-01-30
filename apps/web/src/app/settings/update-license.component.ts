import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-update-license",
  templateUrl: "update-license.component.html",
})
export class UpdateLicenseComponent {
  @Input() organizationId: string;
  @Input() showCancel = true;
  @Output() onUpdated = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  formPromise: Promise<void>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  async submit() {
    const fileEl = document.getElementById("file") as HTMLInputElement;
    const files = fileEl.files;
    if (files == null || files.length === 0) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("selectFile")
      );
      return;
    }

    try {
      const fd = new FormData();
      fd.append("license", files[0]);

      let updatePromise: Promise<void | unknown> = null;
      if (this.organizationId == null) {
        updatePromise = this.apiService.postAccountLicense(fd);
      } else {
        updatePromise = this.organizationApiService.updateLicense(this.organizationId, fd);
      }

      this.formPromise = updatePromise.then(() => {
        return this.apiService.refreshIdentityToken();
      });

      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("updatedLicense"));
      this.onUpdated.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  cancel() {
    this.onCanceled.emit();
  }
}
