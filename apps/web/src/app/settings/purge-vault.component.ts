import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { Verification } from "@bitwarden/common/types/verification";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

@Component({
  selector: "app-purge-vault",
  templateUrl: "purge-vault.component.html",
})
export class PurgeVaultComponent {
  @Input() organizationId?: string = null;

  masterPassword: Verification;
  formPromise: Promise<unknown>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private userVerificationService: UserVerificationService,
    private router: Router,
    private logService: LogService,
    private syncService: SyncService
  ) {}

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.apiService.postPurgeCiphers(request, this.organizationId));
      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("vaultPurged"));
      this.syncService.fullSync(true);
      if (this.organizationId != null) {
        this.router.navigate(["organizations", this.organizationId, "vault"]);
      } else {
        this.router.navigate(["vault"]);
      }
    } catch (e) {
      this.logService.error(e);
    }
  }
}
