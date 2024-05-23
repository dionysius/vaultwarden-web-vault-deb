import { CommonModule } from "@angular/common";
import { booleanAttribute, Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import {
  BadgeModule,
  ButtonModule,
  IconButtonModule,
  ItemModule,
  SectionComponent,
  TypographyModule,
} from "@bitwarden/components";

import { PopupSectionHeaderComponent } from "../../../../../platform/popup/popup-section-header/popup-section-header.component";

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
    PopupSectionHeaderComponent,
    RouterLink,
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
  ciphers: CipherView[];

  /**
   * Title for the vault list item section.
   */
  @Input()
  title: string;

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
  showAutoFill: boolean;
}
