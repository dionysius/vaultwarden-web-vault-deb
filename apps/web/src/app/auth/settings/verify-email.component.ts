import { Component, EventEmitter, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  selector: "app-verify-email",
  templateUrl: "verify-email.component.html",
})
export class VerifyEmailComponent {
  actionPromise: Promise<unknown>;

  @Output() onVerified = new EventEmitter<boolean>();

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private tokenService: TokenService,
  ) {}

  async verifyEmail(): Promise<void> {
    await this.apiService.refreshIdentityToken();
    if (await this.tokenService.getEmailVerified()) {
      this.onVerified.emit(true);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("emailVerified"));
      return;
    }

    await this.apiService.postAccountVerifyEmail();
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("checkInboxForVerification"),
    );
  }

  send = async () => {
    await this.verifyEmail();
  };
}
