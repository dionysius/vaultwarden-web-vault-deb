import { Directive, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { SendService } from "@bitwarden/common/abstractions/send.service";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { SendType } from "@bitwarden/common/enums/sendType";
import { SendView } from "@bitwarden/common/models/view/send.view";

@Directive()
export class SendComponent implements OnInit, OnDestroy {
  disableSend = false;
  sendType = SendType;
  loaded = false;
  loading = true;
  refreshing = false;
  expired = false;
  type: SendType = null;
  sends: SendView[] = [];
  filteredSends: SendView[] = [];
  searchText: string;
  selectedType: SendType;
  selectedAll: boolean;
  searchPlaceholder: string;
  filter: (cipher: SendView) => boolean;
  searchPending = false;
  hasSearched = false; // search() function called - returns true if text qualifies for search

  actionPromise: any;
  onSuccessfulRemovePassword: () => Promise<any>;
  onSuccessfulDelete: () => Promise<any>;
  onSuccessfulLoad: () => Promise<any>;

  private searchTimeout: any;
  private destroy$ = new Subject<void>();

  constructor(
    protected sendService: SendService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected environmentService: EnvironmentService,
    protected ngZone: NgZone,
    protected searchService: SearchService,
    protected policyService: PolicyService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.policyService
      .policyAppliesToActiveUser$(PolicyType.DisableSend)
      .pipe(takeUntil(this.destroy$))
      .subscribe((policyAppliesToActiveUser) => {
        this.disableSend = policyAppliesToActiveUser;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load(filter: (send: SendView) => boolean = null) {
    this.loading = true;
    const sends = await this.sendService.getAllDecrypted();
    this.sends = sends;
    if (this.onSuccessfulLoad != null) {
      await this.onSuccessfulLoad();
    } else {
      // Default action
      this.selectAll();
    }
    this.loading = false;
    this.loaded = true;
  }

  async reload(filter: (send: SendView) => boolean = null) {
    this.loaded = false;
    this.sends = [];
    await this.load(filter);
  }

  async refresh() {
    try {
      this.refreshing = true;
      await this.reload(this.filter);
    } finally {
      this.refreshing = false;
    }
  }

  async applyFilter(filter: (send: SendView) => boolean = null) {
    this.filter = filter;
    await this.search(null);
  }

  async search(timeout: number = null) {
    this.searchPending = false;
    if (this.searchTimeout != null) {
      clearTimeout(this.searchTimeout);
    }
    if (timeout == null) {
      this.hasSearched = this.searchService.isSearchable(this.searchText);
      this.filteredSends = this.sends.filter((s) => this.filter == null || this.filter(s));
      this.applyTextSearch();
      return;
    }
    this.searchPending = true;
    this.searchTimeout = setTimeout(async () => {
      this.hasSearched = this.searchService.isSearchable(this.searchText);
      this.filteredSends = this.sends.filter((s) => this.filter == null || this.filter(s));
      this.applyTextSearch();
      this.searchPending = false;
    }, timeout);
  }

  async removePassword(s: SendView): Promise<boolean> {
    if (this.actionPromise != null || s.password == null) {
      return;
    }
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("removePasswordConfirmation"),
      this.i18nService.t("removePassword"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.actionPromise = this.sendService.removePasswordWithServer(s.id);
      await this.actionPromise;
      if (this.onSuccessfulRemovePassword != null) {
        this.onSuccessfulRemovePassword();
      } else {
        // Default actions
        this.platformUtilsService.showToast("success", null, this.i18nService.t("removedPassword"));
        await this.load();
      }
    } catch (e) {
      this.logService.error(e);
    }
    this.actionPromise = null;
  }

  async delete(s: SendView): Promise<boolean> {
    if (this.actionPromise != null) {
      return false;
    }
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("deleteSendConfirmation"),
      this.i18nService.t("deleteSend"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.actionPromise = this.sendService.deleteWithServer(s.id);
      await this.actionPromise;

      if (this.onSuccessfulDelete != null) {
        this.onSuccessfulDelete();
      } else {
        // Default actions
        this.platformUtilsService.showToast("success", null, this.i18nService.t("deletedSend"));
        await this.refresh();
      }
    } catch (e) {
      this.logService.error(e);
    }
    this.actionPromise = null;
    return true;
  }

  copy(s: SendView) {
    const sendLinkBaseUrl = this.environmentService.getSendUrl();
    const link = sendLinkBaseUrl + s.accessId + "/" + s.urlB64Key;
    this.platformUtilsService.copyToClipboard(link);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("sendLink"))
    );
  }

  searchTextChanged() {
    this.search(200);
  }

  selectAll() {
    this.clearSelections();
    this.selectedAll = true;
    this.applyFilter(null);
  }

  selectType(type: SendType) {
    this.clearSelections();
    this.selectedType = type;
    this.applyFilter((s) => s.type === type);
  }

  clearSelections() {
    this.selectedAll = false;
    this.selectedType = null;
  }

  private applyTextSearch() {
    if (this.searchText != null) {
      this.filteredSends = this.searchService.searchSends(this.filteredSends, this.searchText);
    }
  }
}
