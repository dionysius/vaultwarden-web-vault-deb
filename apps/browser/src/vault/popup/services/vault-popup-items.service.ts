import { inject, Injectable, NgZone } from "@angular/core";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilKeyChanged,
  from,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from "rxjs";

import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { CollectionId, OrganizationId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { BrowserApi } from "../../../platform/browser/browser-api";
import { runInsideAngular } from "../../../platform/browser/run-inside-angular.operator";
import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";
import { PopupCipherView } from "../views/popup-cipher.view";

import { MY_VAULT_ID, VaultPopupListFiltersService } from "./vault-popup-list-filters.service";

/**
 * Service for managing the various item lists on the new Vault tab in the browser popup.
 */
@Injectable({
  providedIn: "root",
})
export class VaultPopupItemsService {
  private _refreshCurrentTab$ = new Subject<void>();
  private _searchText$ = new BehaviorSubject<string>("");
  latestSearchText$: Observable<string> = this._searchText$.asObservable();

  /**
   * Observable that contains the list of other cipher types that should be shown
   * in the autofill section of the Vault tab. Depends on vault settings.
   * @private
   */
  private _otherAutoFillTypes$: Observable<CipherType[]> = combineLatest([
    this.vaultSettingsService.showCardsCurrentTab$,
    this.vaultSettingsService.showIdentitiesCurrentTab$,
  ]).pipe(
    map(([showCards, showIdentities]) => {
      return [
        ...(showCards ? [CipherType.Card] : []),
        ...(showIdentities ? [CipherType.Identity] : []),
      ];
    }),
  );

  /**
   * Observable that contains the current tab to be considered for autofill. If there is no current tab
   * or the popup is in a popout window, this will be null.
   * @private
   */
  private _currentAutofillTab$: Observable<chrome.tabs.Tab | null> = this._refreshCurrentTab$.pipe(
    startWith(null),
    switchMap(async () => {
      if (BrowserPopupUtils.inPopout(window)) {
        return null;
      }
      return await BrowserApi.getTabFromCurrentWindow();
    }),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  /**
   * Observable that contains the list of all decrypted ciphers.
   * @private
   */
  private _cipherList$: Observable<PopupCipherView[]> = this.cipherService.ciphers$.pipe(
    runInsideAngular(inject(NgZone)), // Workaround to ensure cipher$ state provider emissions are run inside Angular
    switchMap(() => Utils.asyncToObservable(() => this.cipherService.getAllDecrypted())),
    map((ciphers) => Object.values(ciphers)),
    switchMap((ciphers) =>
      combineLatest([
        this.organizationService.organizations$,
        this.collectionService.decryptedCollections$,
      ]).pipe(
        map(([organizations, collections]) => {
          const orgMap = Object.fromEntries(organizations.map((org) => [org.id, org]));
          const collectionMap = Object.fromEntries(collections.map((col) => [col.id, col]));
          return ciphers.map(
            (cipher) =>
              new PopupCipherView(
                cipher,
                cipher.collectionIds?.map((colId) => collectionMap[colId as CollectionId]),
                orgMap[cipher.organizationId as OrganizationId],
              ),
          );
        }),
      ),
    ),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  private _filteredCipherList$: Observable<PopupCipherView[]> = combineLatest([
    this._cipherList$,
    this._searchText$,
    this.vaultPopupListFiltersService.filterFunction$,
  ]).pipe(
    map(([ciphers, searchText, filterFunction]): [CipherView[], string] => [
      filterFunction(ciphers),
      searchText,
    ]),
    switchMap(
      ([ciphers, searchText]) =>
        this.searchService.searchCiphers(searchText, null, ciphers) as Promise<PopupCipherView[]>,
    ),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  /**
   * List of ciphers that can be used for autofill on the current tab. Includes cards and/or identities
   * if enabled in the vault settings. Ciphers are sorted by type, then by last used date, then by name.
   *
   * See {@link refreshCurrentTab} to trigger re-evaluation of the current tab.
   */
  autoFillCiphers$: Observable<PopupCipherView[]> = combineLatest([
    this._filteredCipherList$,
    this._otherAutoFillTypes$,
    this._currentAutofillTab$,
  ]).pipe(
    switchMap(([ciphers, otherTypes, tab]) => {
      if (!tab) {
        return of([]);
      }
      return this.cipherService.filterCiphersForUrl(ciphers, tab.url, otherTypes);
    }),
    map((ciphers) => ciphers.sort(this.sortCiphersForAutofill.bind(this))),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  /**
   * List of favorite ciphers that are not currently suggested for autofill.
   * Ciphers are sorted by last used date, then by name.
   */
  favoriteCiphers$: Observable<PopupCipherView[]> = combineLatest([
    this.autoFillCiphers$,
    this._filteredCipherList$,
  ]).pipe(
    map(([autoFillCiphers, ciphers]) =>
      ciphers.filter((cipher) => cipher.favorite && !autoFillCiphers.includes(cipher)),
    ),
    map((ciphers) =>
      ciphers.sort((a, b) => this.cipherService.sortCiphersByLastUsedThenName(a, b)),
    ),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  /**
   * List of all remaining ciphers that are not currently suggested for autofill or marked as favorite.
   * Ciphers are sorted by name.
   */
  remainingCiphers$: Observable<PopupCipherView[]> = combineLatest([
    this.autoFillCiphers$,
    this.favoriteCiphers$,
    this._filteredCipherList$,
  ]).pipe(
    map(([autoFillCiphers, favoriteCiphers, ciphers]) =>
      ciphers.filter(
        (cipher) => !autoFillCiphers.includes(cipher) && !favoriteCiphers.includes(cipher),
      ),
    ),
    map((ciphers) => ciphers.sort(this.cipherService.getLocaleSortingFunction())),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  /**
   * Observable that indicates whether a filter is currently applied to the ciphers.
   */
  hasFilterApplied$ = combineLatest([
    this._searchText$,
    this.vaultPopupListFiltersService.filters$,
  ]).pipe(
    switchMap(([searchText, filters]) => {
      return from(this.searchService.isSearchable(searchText)).pipe(
        map(
          (isSearchable) =>
            isSearchable || Object.values(filters).some((filter) => filter !== null),
        ),
      );
    }),
  );

  /**
   * Observable that indicates whether autofill is allowed in the current context.
   * Autofill is allowed when there is a current tab and the popup is not in a popout window.
   */
  autofillAllowed$: Observable<boolean> = this._currentAutofillTab$.pipe(map((tab) => !!tab));

  /**
   * Observable that indicates whether the user's vault is empty.
   */
  emptyVault$: Observable<boolean> = this._cipherList$.pipe(map((ciphers) => !ciphers.length));

  /**
   * Observable that indicates whether there are no ciphers to show with the current filter.
   */
  noFilteredResults$: Observable<boolean> = this._filteredCipherList$.pipe(
    map((ciphers) => !ciphers.length),
  );

  /** Observable that indicates when the user should see the deactivated org state */
  showDeactivatedOrg$: Observable<boolean> = combineLatest([
    this.vaultPopupListFiltersService.filters$.pipe(distinctUntilKeyChanged("organization")),
    this.organizationService.organizations$,
  ]).pipe(
    map(([filters, orgs]) => {
      if (!filters.organization || filters.organization.id === MY_VAULT_ID) {
        return false;
      }

      const org = orgs.find((o) => o.id === filters.organization.id);
      return org ? !org.enabled : false;
    }),
  );

  constructor(
    private cipherService: CipherService,
    private vaultSettingsService: VaultSettingsService,
    private vaultPopupListFiltersService: VaultPopupListFiltersService,
    private organizationService: OrganizationService,
    private searchService: SearchService,
    private collectionService: CollectionService,
  ) {}

  /**
   * Re-fetch the current tab to trigger a re-evaluation of the autofill ciphers.
   */
  refreshCurrentTab() {
    this._refreshCurrentTab$.next(null);
  }

  applyFilter(newSearchText: string) {
    this._searchText$.next(newSearchText);
  }

  /**
   * Sort function for ciphers to be used in the autofill section of the Vault tab.
   * Sorts by type, then by last used date, and finally by name.
   * @private
   */
  private sortCiphersForAutofill(a: CipherView, b: CipherView): number {
    const typeOrder: Record<CipherType, number> = {
      [CipherType.Login]: 1,
      [CipherType.Card]: 2,
      [CipherType.Identity]: 3,
      [CipherType.SecureNote]: 4,
    };

    // Compare types first
    if (typeOrder[a.type] < typeOrder[b.type]) {
      return -1;
    } else if (typeOrder[a.type] > typeOrder[b.type]) {
      return 1;
    }

    // If types are the same, then sort by last used then name
    return this.cipherService.sortCiphersByLastUsedThenName(a, b);
  }
}
