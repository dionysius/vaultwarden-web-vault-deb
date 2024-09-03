import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import {
  CardComponent,
  LinkModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
} from "@bitwarden/components";

@Component({
  selector: "app-item-history-v2",
  templateUrl: "item-history-v2.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    RouterModule,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    LinkModule,
  ],
})
export class ItemHistoryV2Component {
  @Input() cipher: CipherView;

  get isLogin() {
    return this.cipher.type === CipherType.Login;
  }
}
