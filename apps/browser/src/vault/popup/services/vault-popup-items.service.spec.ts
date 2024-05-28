import { mock } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { CipherId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { BrowserApi } from "../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";

import { VaultPopupItemsService } from "./vault-popup-items.service";

describe("VaultPopupItemsService", () => {
  let service: VaultPopupItemsService;
  let allCiphers: Record<CipherId, CipherView>;
  let autoFillCiphers: CipherView[];

  const cipherServiceMock = mock<CipherService>();
  const vaultSettingsServiceMock = mock<VaultSettingsService>();
  const searchService = mock<SearchService>();

  beforeEach(() => {
    allCiphers = cipherFactory(10);
    const cipherList = Object.values(allCiphers);
    // First 2 ciphers are autofill
    autoFillCiphers = cipherList.slice(0, 2);

    // First autofill cipher is also favorite
    autoFillCiphers[0].favorite = true;

    // 3rd and 4th ciphers are favorite
    cipherList[2].favorite = true;
    cipherList[3].favorite = true;

    cipherServiceMock.cipherViews$ = new BehaviorSubject(allCiphers).asObservable();
    searchService.searchCiphers.mockImplementation(async () => cipherList);
    cipherServiceMock.filterCiphersForUrl.mockImplementation(async () => autoFillCiphers);
    vaultSettingsServiceMock.showCardsCurrentTab$ = new BehaviorSubject(false).asObservable();
    vaultSettingsServiceMock.showIdentitiesCurrentTab$ = new BehaviorSubject(false).asObservable();
    jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValue(false);
    jest
      .spyOn(BrowserApi, "getTabFromCurrentWindow")
      .mockResolvedValue({ url: "https://example.com" } as chrome.tabs.Tab);
    service = new VaultPopupItemsService(
      cipherServiceMock,
      vaultSettingsServiceMock,
      searchService,
    );
  });

  it("should be created", () => {
    service = new VaultPopupItemsService(
      cipherServiceMock,
      vaultSettingsServiceMock,
      searchService,
    );
    expect(service).toBeTruthy();
  });

  describe("autoFillCiphers$", () => {
    it("should return empty array if there is no current tab", (done) => {
      jest.spyOn(BrowserApi, "getTabFromCurrentWindow").mockResolvedValue(null);
      service.autoFillCiphers$.subscribe((ciphers) => {
        expect(ciphers).toEqual([]);
        done();
      });
    });

    it("should return empty array if in Popout window", (done) => {
      jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValue(true);
      service.autoFillCiphers$.subscribe((ciphers) => {
        expect(ciphers).toEqual([]);
        done();
      });
    });

    it("should filter ciphers for the current tab and types", (done) => {
      const currentTab = { url: "https://example.com" } as chrome.tabs.Tab;

      vaultSettingsServiceMock.showCardsCurrentTab$ = new BehaviorSubject(true).asObservable();
      vaultSettingsServiceMock.showIdentitiesCurrentTab$ = new BehaviorSubject(true).asObservable();
      jest.spyOn(BrowserApi, "getTabFromCurrentWindow").mockResolvedValue(currentTab);

      service = new VaultPopupItemsService(
        cipherServiceMock,
        vaultSettingsServiceMock,
        searchService,
      );

      service.autoFillCiphers$.subscribe((ciphers) => {
        expect(cipherServiceMock.filterCiphersForUrl.mock.calls.length).toBe(1);
        expect(cipherServiceMock.filterCiphersForUrl).toHaveBeenCalledWith(
          expect.anything(),
          currentTab.url,
          [CipherType.Card, CipherType.Identity],
        );
        done();
      });
    });

    it("should return ciphers sorted by type, then by last used date, then by name", (done) => {
      const expectedTypeOrder: Record<CipherType, number> = {
        [CipherType.Login]: 1,
        [CipherType.Card]: 2,
        [CipherType.Identity]: 3,
        [CipherType.SecureNote]: 4,
      };

      // Assume all ciphers are autofill ciphers to test sorting
      cipherServiceMock.filterCiphersForUrl.mockImplementation(async () =>
        Object.values(allCiphers),
      );

      service = new VaultPopupItemsService(
        cipherServiceMock,
        vaultSettingsServiceMock,
        searchService,
      );

      service.autoFillCiphers$.subscribe((ciphers) => {
        expect(ciphers.length).toBe(10);

        for (let i = 0; i < ciphers.length - 1; i++) {
          const current = ciphers[i];
          const next = ciphers[i + 1];

          expect(expectedTypeOrder[current.type]).toBeLessThanOrEqual(expectedTypeOrder[next.type]);
        }
        expect(cipherServiceMock.sortCiphersByLastUsedThenName).toHaveBeenCalled();
        done();
      });
    });

    it("should filter autoFillCiphers$ down to search term", (done) => {
      const cipherList = Object.values(allCiphers);
      const searchText = "Login";

      searchService.searchCiphers.mockImplementation(async () => {
        return cipherList.filter((cipher) => {
          return cipher.name.includes(searchText);
        });
      });

      // there is only 1 Login returned for filteredCiphers. but two results expected because of other autofill types
      service.autoFillCiphers$.subscribe((ciphers) => {
        expect(ciphers[0].name.includes(searchText)).toBe(true);
        expect(ciphers.length).toBe(2);
        done();
      });
    });
  });

  describe("favoriteCiphers$", () => {
    it("should exclude autofill ciphers", (done) => {
      service.favoriteCiphers$.subscribe((ciphers) => {
        // 2 autofill ciphers, 3 favorite ciphers, 1 favorite cipher is also autofill = 2 favorite ciphers to show
        expect(ciphers.length).toBe(2);
        done();
      });
    });

    it("should sort by last used then by name", (done) => {
      service.favoriteCiphers$.subscribe((ciphers) => {
        expect(cipherServiceMock.sortCiphersByLastUsedThenName).toHaveBeenCalled();
        done();
      });
    });

    it("should filter favoriteCiphers$ down to search term", (done) => {
      const cipherList = Object.values(allCiphers);
      const searchText = "Card 2";

      searchService.searchCiphers.mockImplementation(async () => {
        return cipherList.filter((cipher) => {
          return cipher.name === searchText;
        });
      });

      service.favoriteCiphers$.subscribe((ciphers) => {
        // There are 2 favorite items but only one Card 2
        expect(ciphers[0].name).toBe(searchText);
        expect(ciphers.length).toBe(1);
        done();
      });
    });
  });

  describe("remainingCiphers$", () => {
    it("should exclude autofill and favorite ciphers", (done) => {
      service.remainingCiphers$.subscribe((ciphers) => {
        // 2 autofill ciphers, 2 favorite ciphers = 6 remaining ciphers to show
        expect(ciphers.length).toBe(6);
        done();
      });
    });

    it("should sort by last used then by name", (done) => {
      service.remainingCiphers$.subscribe((ciphers) => {
        expect(cipherServiceMock.getLocaleSortingFunction).toHaveBeenCalled();
        done();
      });
    });

    it("should filter remainingCiphers$ down to search term", (done) => {
      const cipherList = Object.values(allCiphers);
      const searchText = "Login";

      searchService.searchCiphers.mockImplementation(async () => {
        return cipherList.filter((cipher) => {
          return cipher.name.includes(searchText);
        });
      });

      service.remainingCiphers$.subscribe((ciphers) => {
        // There are 6 remaining ciphers but only 2 with "Login" in the name
        expect(ciphers.length).toBe(2);
        done();
      });
    });
  });

  describe("emptyVault$", () => {
    it("should return true if there are no ciphers", (done) => {
      cipherServiceMock.cipherViews$ = new BehaviorSubject({}).asObservable();
      service = new VaultPopupItemsService(
        cipherServiceMock,
        vaultSettingsServiceMock,
        searchService,
      );
      service.emptyVault$.subscribe((empty) => {
        expect(empty).toBe(true);
        done();
      });
    });

    it("should return false if there are ciphers", (done) => {
      service.emptyVault$.subscribe((empty) => {
        expect(empty).toBe(false);
        done();
      });
    });
  });

  describe("autoFillAllowed$", () => {
    it("should return true if there is a current tab", (done) => {
      service.autofillAllowed$.subscribe((allowed) => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should return false if there is no current tab", (done) => {
      jest.spyOn(BrowserApi, "getTabFromCurrentWindow").mockResolvedValue(null);
      service.autofillAllowed$.subscribe((allowed) => {
        expect(allowed).toBe(false);
        done();
      });
    });

    it("should return false if in a Popout", (done) => {
      jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValue(true);
      service.autofillAllowed$.subscribe((allowed) => {
        expect(allowed).toBe(false);
        done();
      });
    });
  });

  describe("noFilteredResults$", () => {
    it("should return false when filteredResults has values", (done) => {
      service.noFilteredResults$.subscribe((noResults) => {
        expect(noResults).toBe(false);
        done();
      });
    });

    it("should return true when there are zero filteredResults", (done) => {
      searchService.searchCiphers.mockImplementation(async () => []);
      service.noFilteredResults$.subscribe((noResults) => {
        expect(noResults).toBe(true);
        done();
      });
    });
  });

  describe("hasFilterApplied$", () => {
    it("should return true if the search term provided is searchable", (done) => {
      searchService.isSearchable.mockImplementation(async () => true);
      service.hasFilterApplied$.subscribe((canSearch) => {
        expect(canSearch).toBe(true);
        done();
      });
    });

    it("should return false if the search term provided is not searchable", (done) => {
      searchService.isSearchable.mockImplementation(async () => false);
      service.hasFilterApplied$.subscribe((canSearch) => {
        expect(canSearch).toBe(false);
        done();
      });
    });
  });

  describe("applyFilter", () => {
    it("should call search Service with the new search term", (done) => {
      const searchText = "Hello";
      service.applyFilter(searchText);
      const searchServiceSpy = jest.spyOn(searchService, "searchCiphers");

      service.favoriteCiphers$.subscribe(() => {
        expect(searchServiceSpy).toHaveBeenCalledWith(searchText, null, expect.anything());
        done();
      });
    });
  });
});

// A function to generate a list of ciphers of different types
function cipherFactory(count: number): Record<CipherId, CipherView> {
  const ciphers: CipherView[] = [];
  for (let i = 0; i < count; i++) {
    const type = ((i % 4) + 1) as CipherType;
    switch (type) {
      case CipherType.Login:
        ciphers.push({
          id: `${i}`,
          type: CipherType.Login,
          name: `Login ${i}`,
          login: {
            username: `username${i}`,
            password: `password${i}`,
          },
        } as CipherView);
        break;
      case CipherType.SecureNote:
        ciphers.push({
          id: `${i}`,
          type: CipherType.SecureNote,
          name: `SecureNote ${i}`,
          notes: `notes${i}`,
        } as CipherView);
        break;
      case CipherType.Card:
        ciphers.push({
          id: `${i}`,
          type: CipherType.Card,
          name: `Card ${i}`,
          card: {
            cardholderName: `cardholderName${i}`,
            number: `number${i}`,
            brand: `brand${i}`,
          },
        } as CipherView);
        break;
      case CipherType.Identity:
        ciphers.push({
          id: `${i}`,
          type: CipherType.Identity,
          name: `Identity ${i}`,
          identity: {
            firstName: `firstName${i}`,
            lastName: `lastName${i}`,
          },
        } as CipherView);
        break;
    }
  }
  return Object.fromEntries(ciphers.map((c) => [c.id, c]));
}
