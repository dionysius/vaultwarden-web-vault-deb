import { Directive, OnInit } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordHistoryView } from "@bitwarden/common/vault/models/view/password-history.view";

@Directive()
export class PasswordHistoryComponent implements OnInit {
  cipherId: string;
  history: PasswordHistoryView[] = [];

  constructor(
    protected cipherService: CipherService,
    protected platformUtilsService: PlatformUtilsService,
    protected i18nService: I18nService,
    private win: Window
  ) {}

  async ngOnInit() {
    await this.init();
  }

  copy(password: string) {
    const copyOptions = this.win != null ? { window: this.win } : null;
    this.platformUtilsService.copyToClipboard(password, copyOptions);
    this.platformUtilsService.showToast(
      "info",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("password"))
    );
  }

  protected async init() {
    const cipher = await this.cipherService.get(this.cipherId);
    const decCipher = await cipher.decrypt();
    this.history = decCipher.passwordHistory == null ? [] : decCipher.passwordHistory;
  }
}
