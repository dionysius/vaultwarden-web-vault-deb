import { Component, EventEmitter, Input, Output } from "@angular/core";

import { EventService } from "@bitwarden/common/abstractions/event.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PasswordRepromptService } from "@bitwarden/common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { CipherRepromptType } from "@bitwarden/common/enums/cipherRepromptType";
import { CipherType } from "@bitwarden/common/enums/cipherType";
import { EventType } from "@bitwarden/common/enums/eventType";
import { CipherView } from "@bitwarden/common/models/view/cipher.view";

@Component({
  selector: "app-action-buttons",
  templateUrl: "action-buttons.component.html",
})
export class ActionButtonsComponent {
  @Output() onView = new EventEmitter<CipherView>();
  @Output() launchEvent = new EventEmitter<CipherView>();
  @Input() cipher: CipherView;
  @Input() showView = false;

  cipherType = CipherType;
  userHasPremiumAccess = false;

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private eventService: EventService,
    private totpService: TotpService,
    private stateService: StateService,
    private passwordRepromptService: PasswordRepromptService
  ) {}

  async ngOnInit() {
    this.userHasPremiumAccess = await this.stateService.getCanAccessPremium();
  }

  launchCipher() {
    this.launchEvent.emit(this.cipher);
  }

  async copy(cipher: CipherView, value: string, typeI18nKey: string, aType: string) {
    if (
      this.cipher.reprompt !== CipherRepromptType.None &&
      this.passwordRepromptService.protectedFields().includes(aType) &&
      !(await this.passwordRepromptService.showPasswordPrompt())
    ) {
      return;
    }

    if (value == null || (aType === "TOTP" && !this.displayTotpCopyButton(cipher))) {
      return;
    } else if (aType === "TOTP") {
      value = await this.totpService.getCode(value);
    }

    if (!cipher.viewPassword) {
      return;
    }

    this.platformUtilsService.copyToClipboard(value, { window: window });
    this.platformUtilsService.showToast(
      "info",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t(typeI18nKey))
    );

    if (typeI18nKey === "password" || typeI18nKey === "verificationCodeTotp") {
      this.eventService.collect(EventType.Cipher_ClientToggledHiddenFieldVisible, cipher.id);
    } else if (typeI18nKey === "securityCode") {
      this.eventService.collect(EventType.Cipher_ClientCopiedCardCode, cipher.id);
    }
  }

  displayTotpCopyButton(cipher: CipherView) {
    return (
      (cipher?.login?.hasTotp ?? false) && (cipher.organizationUseTotp || this.userHasPremiumAccess)
    );
  }

  view() {
    this.onView.emit(this.cipher);
  }
}
