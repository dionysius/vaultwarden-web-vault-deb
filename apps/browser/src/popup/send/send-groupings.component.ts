import { ChangeDetectorRef, Component, NgZone } from "@angular/core";
import { Router } from "@angular/router";

import { SendComponent as BaseSendComponent } from "jslib-angular/components/send/send.component";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { SearchService } from "jslib-common/abstractions/search.service";
import { SendService } from "jslib-common/abstractions/send.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { SendType } from "jslib-common/enums/sendType";
import { SendView } from "jslib-common/models/view/sendView";

import { BrowserSendComponentState } from "../../models/browserSendComponentState";
import { StateService } from "../../services/abstractions/state.service";
import { PopupUtilsService } from "../services/popup-utils.service";

const ComponentId = "SendComponent";

@Component({
  selector: "app-send-groupings",
  templateUrl: "send-groupings.component.html",
})
export class SendGroupingsComponent extends BaseSendComponent {
  // Header
  showLeftHeader = true;
  // Send Type Calculations
  typeCounts = new Map<SendType, number>();
  // State Handling
  state: BrowserSendComponentState;
  private loadedTimeout: number;

  constructor(
    sendService: SendService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    environmentService: EnvironmentService,
    ngZone: NgZone,
    policyService: PolicyService,
    searchService: SearchService,
    private popupUtils: PopupUtilsService,
    private stateService: StateService,
    private router: Router,
    private syncService: SyncService,
    private changeDetectorRef: ChangeDetectorRef,
    private broadcasterService: BroadcasterService,
    logService: LogService
  ) {
    super(
      sendService,
      i18nService,
      platformUtilsService,
      environmentService,
      ngZone,
      searchService,
      policyService,
      logService
    );
    super.onSuccessfulLoad = async () => {
      this.calculateTypeCounts();
      this.selectAll();
    };
  }

  async ngOnInit() {
    // Determine Header details
    this.showLeftHeader = !(
      this.popupUtils.inSidebar(window) && this.platformUtilsService.isFirefox()
    );
    // Clear state of Send Type Component
    await this.stateService.setBrowserSendTypeComponentState(null);
    // Let super class finish
    await super.ngOnInit();
    // Handle State Restore if necessary
    const restoredScopeState = await this.restoreState();
    if (this.state?.searchText != null) {
      this.searchText = this.state.searchText;
    }

    if (!this.syncService.syncInProgress) {
      this.load();
    } else {
      this.loadedTimeout = window.setTimeout(() => {
        if (!this.loaded) {
          this.load();
        }
      }, 5000);
    }

    if (!this.syncService.syncInProgress || restoredScopeState) {
      window.setTimeout(() => this.popupUtils.setContentScrollY(window, this.state?.scrollY), 0);
    }

    // Load all sends if sync completed in background
    this.broadcasterService.subscribe(ComponentId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "syncCompleted":
            window.setTimeout(() => {
              this.load();
            }, 500);
            break;
          default:
            break;
        }

        this.changeDetectorRef.detectChanges();
      });
    });
  }

  ngOnDestroy() {
    // Remove timeout
    if (this.loadedTimeout != null) {
      window.clearTimeout(this.loadedTimeout);
    }
    // Save state
    this.saveState();
    // Unsubscribe
    this.broadcasterService.unsubscribe(ComponentId);
  }

  async selectType(type: SendType) {
    this.router.navigate(["/send-type"], { queryParams: { type: type } });
  }

  async selectSend(s: SendView) {
    this.router.navigate(["/edit-send"], { queryParams: { sendId: s.id } });
  }

  async addSend() {
    if (this.disableSend) {
      return;
    }
    this.router.navigate(["/add-send"]);
  }

  async removePassword(s: SendView): Promise<boolean> {
    if (this.disableSend) {
      return;
    }
    super.removePassword(s);
  }

  showSearching() {
    return (
      this.hasSearched || (!this.searchPending && this.searchService.isSearchable(this.searchText))
    );
  }

  private calculateTypeCounts() {
    // Create type counts
    const typeCounts = new Map<SendType, number>();
    this.sends.forEach((s) => {
      if (typeCounts.has(s.type)) {
        typeCounts.set(s.type, typeCounts.get(s.type) + 1);
      } else {
        typeCounts.set(s.type, 1);
      }
    });
    this.typeCounts = typeCounts;
  }

  private async saveState() {
    this.state = {
      scrollY: this.popupUtils.getContentScrollY(window),
      searchText: this.searchText,
      sends: this.sends,
      typeCounts: this.typeCounts,
    };
    await this.stateService.setBrowserSendComponentState(this.state);
  }

  private async restoreState(): Promise<boolean> {
    this.state = await this.stateService.getBrowserSendComponentState();
    if (this.state == null) {
      return false;
    }

    if (this.state.sends != null) {
      this.sends = this.state.sends;
    }
    if (this.state.typeCounts != null) {
      this.typeCounts = this.state.typeCounts;
    }

    return true;
  }
}
