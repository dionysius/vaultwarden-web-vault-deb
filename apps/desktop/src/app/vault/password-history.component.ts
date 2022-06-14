import { Component } from "@angular/core";

import { PasswordHistoryComponent as BasePasswordHistoryComponent } from "@bitwarden/angular/components/password-history.component";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

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
