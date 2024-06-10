import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { SearchModule, ButtonModule } from "@bitwarden/components";

import { PopupFooterComponent } from "../../../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "../../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../../platform/popup/layout/popup-page.component";

@Component({
  selector: "app-add-edit-v2",
  templateUrl: "add-edit-v2.component.html",
  standalone: true,
  imports: [
    CommonModule,
    SearchModule,
    JslibModule,
    FormsModule,
    ButtonModule,
    PopupPageComponent,
    PopupHeaderComponent,
    PopupFooterComponent,
  ],
})
export class AddEditV2Component {
  headerText: string;

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
  ) {
    this.subscribeToParams();
  }

  subscribeToParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      const isNew = params.isNew.toLowerCase() === "true";
      const cipherType = parseInt(params.type);

      this.headerText = this.setHeader(isNew, cipherType);
    });
  }

  setHeader(isNew: boolean, type: CipherType) {
    const partOne = isNew ? "newItemHeader" : "editItemHeader";

    switch (type) {
      case CipherType.Login:
        return this.i18nService.t(partOne, this.i18nService.t("typeLogin"));
      case CipherType.Card:
        return this.i18nService.t(partOne, this.i18nService.t("typeCard"));
      case CipherType.Identity:
        return this.i18nService.t(partOne, this.i18nService.t("typeIdentity"));
      case CipherType.SecureNote:
        return this.i18nService.t(partOne, this.i18nService.t("note"));
    }
  }
}
