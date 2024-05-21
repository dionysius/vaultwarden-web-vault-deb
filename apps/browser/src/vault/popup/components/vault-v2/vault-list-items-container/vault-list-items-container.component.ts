import { CommonModule } from "@angular/common";
import { booleanAttribute, Component, Input } from "@angular/core";
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
  @Input()
  ciphers: CipherView[];

  @Input()
  title: string;

  @Input({ transform: booleanAttribute })
  showAutoFill: boolean;
}
