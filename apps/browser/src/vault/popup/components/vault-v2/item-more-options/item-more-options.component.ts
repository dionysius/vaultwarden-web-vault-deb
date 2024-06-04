import { CommonModule } from "@angular/common";
import { booleanAttribute, Component, Input } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherRepromptType, CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { DialogService, IconButtonModule, ItemModule, MenuModule } from "@bitwarden/components";
import { PasswordRepromptService } from "@bitwarden/vault";

import { BrowserApi } from "../../../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../../../platform/popup/browser-popup-utils";
import { VaultPopupItemsService } from "../../../services/vault-popup-items.service";

@Component({
  standalone: true,
  selector: "app-item-more-options",
  templateUrl: "./item-more-options.component.html",
  imports: [ItemModule, IconButtonModule, MenuModule, CommonModule, JslibModule, RouterModule],
})
export class ItemMoreOptionsComponent {
  @Input({
    required: true,
  })
  cipher: CipherView;

  /**
   * Flag to hide the login specific menu options. Used for login items that are
   * already in the autofill list suggestion.
   */
  @Input({ transform: booleanAttribute })
  hideLoginOptions: boolean;

  protected autofillAllowed$ = this.vaultPopupItemsService.autofillAllowed$;

  constructor(
    private cipherService: CipherService,
    private vaultPopupItemsService: VaultPopupItemsService,
    private passwordRepromptService: PasswordRepromptService,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  get canEdit() {
    return this.cipher.edit;
  }

  get isLogin() {
    return this.cipher.type === CipherType.Login;
  }

  get favoriteText() {
    return this.cipher.favorite ? "unfavorite" : "favorite";
  }

  /**
   * Determines if the login cipher can be launched in a new browser tab.
   */
  get canLaunch() {
    return this.isLogin && this.cipher.login.canLaunch;
  }

  /**
   * Launches the login cipher in a new browser tab.
   */
  async launchCipher() {
    if (!this.canLaunch) {
      return;
    }

    await this.cipherService.updateLastLaunchedDate(this.cipher.id);

    await BrowserApi.createNewTab(this.cipher.login.launchUri);

    if (BrowserPopupUtils.inPopup(window)) {
      BrowserApi.closePopup(window);
    }
  }

  /**
   * Toggles the favorite status of the cipher and updates it on the server.
   */
  async toggleFavorite() {
    this.cipher.favorite = !this.cipher.favorite;
    const encryptedCipher = await this.cipherService.encrypt(this.cipher);
    await this.cipherService.updateWithServer(encryptedCipher);
  }

  /**
   * Navigate to the clone cipher page with the current cipher as the source.
   * A password reprompt is attempted if the cipher requires it.
   * A confirmation dialog is shown if the cipher has FIDO2 credentials.
   */
  async clone() {
    if (
      this.cipher.reprompt === CipherRepromptType.Password &&
      !(await this.passwordRepromptService.showPasswordPrompt())
    ) {
      return;
    }

    if (this.cipher.login?.hasFido2Credentials) {
      const confirmed = await this.dialogService.openSimpleDialog({
        title: { key: "passkeyNotCopied" },
        content: { key: "passkeyNotCopiedAlert" },
        type: "info",
      });

      if (!confirmed) {
        return;
      }
    }

    await this.router.navigate(["/clone-cipher"], {
      queryParams: {
        cloneMode: true,
        cipherId: this.cipher.id,
      },
    });
  }
}
