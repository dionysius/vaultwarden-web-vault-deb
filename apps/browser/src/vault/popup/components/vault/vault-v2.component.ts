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
import { VaultListFiltersComponent } from "../vault-v2/vault-list-filters/vault-list-filters.component";
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
    VaultListFiltersComponent,
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
  protected showDeactivatedOrg$ = this.vaultPopupItemsService.showDeactivatedOrg$;

  protected vaultIcon = Icons.Vault;
  protected deactivatedIcon = Icons.DeactivatedOrg;
  protected noResultsIcon = Icons.NoResults;

  constructor(
    private vaultPopupItemsService: VaultPopupItemsService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  addCipher() {
    // TODO: Add currently filtered organization to query params if available
    void this.router.navigate(["/add-cipher"], {});
  }
}
