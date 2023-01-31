import { Component } from "@angular/core";

import { PasswordHistoryComponent as BasePasswordHistoryComponent } from "@bitwarden/angular/vault/components/password-history.component";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

@Component({
  selector: "app-password-history",
  templateUrl: "password-history.component.html",
})
export class PasswordHistoryComponent extends BasePasswordHistoryComponent {
  constructor(
    cipherService: CipherService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService
  ) {
    super(cipherService, platformUtilsService, i18nService, window);
  }
}
