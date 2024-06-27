import { CommonModule } from "@angular/common";
import { booleanAttribute, Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import {
  BadgeModule,
  ButtonModule,
  IconButtonModule,
  ItemModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
} from "@bitwarden/components";

import { VaultPopupAutofillService } from "../../../services/vault-popup-autofill.service";
import { PopupCipherView } from "../../../views/popup-cipher.view";
import { ItemCopyActionsComponent } from "../item-copy-action/item-copy-actions.component";
import { ItemMoreOptionsComponent } from "../item-more-options/item-more-options.component";

@Component({
  imports: [
    CommonModule,
    ItemModule,
    ButtonModule,
    BadgeModule,
    IconButtonModule,
    SectionComponent,
    TypographyModule,
    JslibModule,
    SectionHeaderComponent,
    RouterLink,
    ItemCopyActionsComponent,
    ItemMoreOptionsComponent,
  ],
  selector: "app-vault-list-items-container",
  templateUrl: "vault-list-items-container.component.html",
  standalone: true,
})
export class VaultListItemsContainerComponent {
  /**
   * The list of ciphers to display.
   */
  @Input()
  ciphers: PopupCipherView[] = [];

  /**
   * Title for the vault list item section.
   */
  @Input()
  title: string;

  /**
   * Optional description for the vault list item section. Will be shown below the title even when
   * no ciphers are available.
   */
  @Input()
  description: string;

  /**
   * Option to show a refresh button in the section header.
   */
  @Input({ transform: booleanAttribute })
  showRefresh: boolean;

  /**
   * Event emitted when the refresh button is clicked.
   */
  @Output()
  onRefresh = new EventEmitter<void>();

  /**
   * Option to show the autofill button for each item.
   */
  @Input({ transform: booleanAttribute })
  showAutofillButton: boolean;

  /**
   * The tooltip text for the organization icon for ciphers that belong to an organization.
   * @param cipher
   */
  orgIconTooltip(cipher: PopupCipherView) {
    if (cipher.collectionIds.length > 1) {
      return this.i18nService.t("nCollections", cipher.collectionIds.length);
    }

    return cipher.collections[0]?.name;
  }

  constructor(
    private i18nService: I18nService,
    private vaultPopupAutofillService: VaultPopupAutofillService,
  ) {}

  async doAutofill(cipher: PopupCipherView) {
    await this.vaultPopupAutofillService.doAutofill(cipher);
  }
}
