import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { AccountApiService } from "@bitwarden/common/auth/abstractions/account-api.service";
import { Verification } from "@bitwarden/common/types/verification";

@Component({
  selector: "app-delete-account",
  templateUrl: "delete-account.component.html",
})
export class DeleteAccountComponent {
  formPromise: Promise<void>;

  deleteForm = this.formBuilder.group({
    verification: undefined as Verification | undefined,
  });

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private formBuilder: FormBuilder,
    private accountApiService: AccountApiService,
    private logService: LogService
  ) {}

  async submit() {
    try {
      const verification = this.deleteForm.get("verification").value;
      this.formPromise = this.accountApiService.deleteAccount(verification);
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("accountDeleted"),
        this.i18nService.t("accountDeletedDesc")
      );
    } catch (e) {
      this.logService.error(e);
    }
  }
}
