import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PasswordRepromptService } from "@bitwarden/common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SyncService } from "@bitwarden/common/abstractions/sync.service";
import { CipherRepromptType } from "@bitwarden/common/enums/cipherRepromptType";
import { CipherType } from "@bitwarden/common/enums/cipherType";
import { Utils } from "@bitwarden/common/misc/utils";
import { CipherView } from "@bitwarden/common/models/view/cipherView";

import { BrowserApi } from "../../browser/browserApi";
import { AutofillService } from "../../services/abstractions/autofill.service";
import { VaultFilterService } from "../../services/vaultFilter.service";
import { PopupUtilsService } from "../services/popup-utils.service";

const BroadcasterSubscriptionId = "CurrentTabComponent";

@Component({
  selector: "app-current-tab",
  templateUrl: "current-tab.component.html",
})
export class CurrentTabComponent implements OnInit, OnDestroy {
  pageDetails: any[] = [];
  cardCiphers: CipherView[];
  identityCiphers: CipherView[];
  loginCiphers: CipherView[];
  url: string;
  hostname: string;
  searchText: string;
  inSidebar = false;
  searchTypeSearch = false;
  loaded = false;
  showOrganizations = false;

  private totpCode: string;
  private totpTimeout: number;
  private loadedTimeout: number;
  private searchTimeout: number;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private cipherService: CipherService,
    private popupUtilsService: PopupUtilsService,
    private autofillService: AutofillService,
    private i18nService: I18nService,
    private router: Router,
    private ngZone: NgZone,
    private broadcasterService: BroadcasterService,
    private changeDetectorRef: ChangeDetectorRef,
    private syncService: SyncService,
    private searchService: SearchService,
    private stateService: StateService,
    private passwordRepromptService: PasswordRepromptService,
    private organizationService: OrganizationService,
    private vaultFilterService: VaultFilterService
  ) {}

  async ngOnInit() {
    this.searchTypeSearch = !this.platformUtilsService.isSafari();
    this.inSidebar = this.popupUtilsService.inSidebar(window);

    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "syncCompleted":
            if (this.loaded) {
              window.setTimeout(() => {
                this.load();
              }, 500);
            }
            break;
          case "collectPageDetailsResponse":
            if (message.sender === BroadcasterSubscriptionId) {
              this.pageDetails.push({
                frameId: message.webExtSender.frameId,
                tab: message.tab,
                details: message.details,
              });
            }
            break;
          default:
            break;
        }

        this.changeDetectorRef.detectChanges();
      });
    });

    if (!this.syncService.syncInProgress) {
      await this.load();
    } else {
      this.loadedTimeout = window.setTimeout(async () => {
        if (!this.loaded) {
          await this.load();
        }
      }, 5000);
    }

    window.setTimeout(() => {
      document.getElementById("search").focus();
    }, 100);
  }

  ngOnDestroy() {
    window.clearTimeout(this.loadedTimeout);
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async refresh() {
    await this.load();
  }

  addCipher() {
    this.router.navigate(["/add-cipher"], {
      queryParams: {
        name: this.hostname,
        uri: this.url,
        selectedVault: this.vaultFilterService.getVaultFilter().selectedOrganizationId,
      },
    });
  }

  viewCipher(cipher: CipherView) {
    this.router.navigate(["/view-cipher"], { queryParams: { cipherId: cipher.id } });
  }

  async fillCipher(cipher: CipherView) {
    if (
      cipher.reprompt !== CipherRepromptType.None &&
      !(await this.passwordRepromptService.showPasswordPrompt())
    ) {
      return;
    }

    this.totpCode = null;
    if (this.totpTimeout != null) {
      window.clearTimeout(this.totpTimeout);
    }

    if (this.pageDetails == null || this.pageDetails.length === 0) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("autofillError"));
      return;
    }

    try {
      this.totpCode = await this.autofillService.doAutoFill({
        cipher: cipher,
        pageDetails: this.pageDetails,
        doc: window.document,
        fillNewPassword: true,
      });
      if (this.totpCode != null) {
        this.platformUtilsService.copyToClipboard(this.totpCode, { window: window });
      }
      if (this.popupUtilsService.inPopup(window)) {
        if (this.platformUtilsService.isFirefox() || this.platformUtilsService.isSafari()) {
          BrowserApi.closePopup(window);
        } else {
          // Slight delay to fix bug in Chromium browsers where popup closes without copying totp to clipboard
          setTimeout(() => BrowserApi.closePopup(window), 50);
        }
      }
    } catch {
      this.ngZone.run(() => {
        this.platformUtilsService.showToast("error", null, this.i18nService.t("autofillError"));
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  searchVault() {
    if (this.searchTimeout != null) {
      clearTimeout(this.searchTimeout);
    }
    if (!this.searchService.isSearchable(this.searchText)) {
      return;
    }
    this.searchTimeout = window.setTimeout(async () => {
      this.router.navigate(["/tabs/vault"], { queryParams: { searchText: this.searchText } });
    }, 200);
  }

  closeOnEsc(e: KeyboardEvent) {
    // If input not empty, use browser default behavior of clearing input instead
    if (e.key === "Escape" && (this.searchText == null || this.searchText === "")) {
      BrowserApi.closePopup(window);
    }
  }

  private async load() {
    this.loaded = false;
    const tab = await BrowserApi.getTabFromCurrentWindow();
    if (tab != null) {
      this.url = tab.url;
    } else {
      this.loginCiphers = [];
      this.loaded = true;
      return;
    }

    this.hostname = Utils.getHostname(this.url);
    this.pageDetails = [];
    BrowserApi.tabSendMessage(tab, {
      command: "collectPageDetails",
      tab: tab,
      sender: BroadcasterSubscriptionId,
    });

    const otherTypes: CipherType[] = [];
    const dontShowCards = await this.stateService.getDontShowCardsCurrentTab();
    const dontShowIdentities = await this.stateService.getDontShowIdentitiesCurrentTab();
    this.showOrganizations = await this.organizationService.hasOrganizations();
    if (!dontShowCards) {
      otherTypes.push(CipherType.Card);
    }
    if (!dontShowIdentities) {
      otherTypes.push(CipherType.Identity);
    }

    const ciphers = await this.cipherService.getAllDecryptedForUrl(
      this.url,
      otherTypes.length > 0 ? otherTypes : null
    );

    this.loginCiphers = [];
    this.cardCiphers = [];
    this.identityCiphers = [];

    ciphers.forEach((c) => {
      if (!this.vaultFilterService.filterCipherForSelectedVault(c)) {
        switch (c.type) {
          case CipherType.Login:
            this.loginCiphers.push(c);
            break;
          case CipherType.Card:
            this.cardCiphers.push(c);
            break;
          case CipherType.Identity:
            this.identityCiphers.push(c);
            break;
          default:
            break;
        }
      }
    });

    this.loginCiphers = this.loginCiphers.sort((a, b) =>
      this.cipherService.sortCiphersByLastUsedThenName(a, b)
    );
    this.loaded = true;
  }
}
