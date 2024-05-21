import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { combineLatest, map, Observable } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { SectionComponent, TypographyModule } from "@bitwarden/components";

import { PopupSectionHeaderComponent } from "../../../../../platform/popup/popup-section-header/popup-section-header.component";
import { VaultPopupItemsService } from "../../../services/vault-popup-items.service";
import { VaultListItemsContainerComponent } from "../vault-list-items-container/vault-list-items-container.component";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    SectionComponent,
    TypographyModule,
    VaultListItemsContainerComponent,
    JslibModule,
    PopupSectionHeaderComponent,
  ],
  selector: "app-autofill-vault-list-items",
  templateUrl: "autofill-vault-list-items.component.html",
})
export class AutofillVaultListItemsComponent {
  /**
   * The list of ciphers that can be used to autofill the current page.
   * @protected
   */
  protected autofillCiphers$: Observable<CipherView[]> =
    this.vaultPopupItemsService.autoFillCiphers$;

  /**
   * Observable that determines whether the empty autofill tip should be shown.
   * The tip is shown when there are no ciphers to autofill, no filter is applied, and autofill is allowed in
   * the current context (e.g. not in a popout).
   * @protected
   */
  protected showEmptyAutofillTip$: Observable<boolean> = combineLatest([
    this.vaultPopupItemsService.hasFilterApplied$,
    this.autofillCiphers$,
    this.vaultPopupItemsService.autofillAllowed$,
  ]).pipe(
    map(([hasFilter, ciphers, canAutoFill]) => !hasFilter && canAutoFill && ciphers.length === 0),
  );

  constructor(private vaultPopupItemsService: VaultPopupItemsService) {
    // TODO: Migrate logic to show Autofill policy toast PM-8144
  }
}
