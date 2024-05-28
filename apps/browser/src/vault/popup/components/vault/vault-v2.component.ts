import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule, Icons, NoItemsModule } from "@bitwarden/components";

import { CurrentAccountComponent } from "../../../../auth/popup/account-switching/current-account.component";
import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";
import { PopupHeaderComponent } from "../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../platform/popup/layout/popup-page.component";
import { VaultPopupItemsService } from "../../services/vault-popup-items.service";
import { AutofillVaultListItemsComponent, VaultListItemsContainerComponent } from "../vault-v2";
import { VaultV2SearchComponent } from "../vault-v2/vault-search/vault-v2-search.component";

@Component({
  selector: "app-vault",
  templateUrl: "vault-v2.component.html",
  standalone: true,
  imports: [
    PopupPageComponent,
    PopupHeaderComponent,
    PopOutComponent,
    CurrentAccountComponent,
    NoItemsModule,
    JslibModule,
    CommonModule,
    AutofillVaultListItemsComponent,
    VaultListItemsContainerComponent,
    ButtonModule,
    RouterLink,
    VaultV2SearchComponent,
  ],
})
export class VaultV2Component implements OnInit, OnDestroy {
  protected favoriteCiphers$ = this.vaultPopupItemsService.favoriteCiphers$;
  protected remainingCiphers$ = this.vaultPopupItemsService.remainingCiphers$;

  protected showEmptyState$ = this.vaultPopupItemsService.emptyVault$;
  protected showNoResultsState$ = this.vaultPopupItemsService.noFilteredResults$;

  protected vaultIcon = Icons.Vault;

  constructor(
    private vaultPopupItemsService: VaultPopupItemsService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  handleSearchTextChange(searchText: string) {
    this.vaultPopupItemsService.applyFilter(searchText);
  }

  addCipher() {
    // TODO: Add currently filtered organization to query params if available
    void this.router.navigate(["/add-cipher"], {});
  }
}
