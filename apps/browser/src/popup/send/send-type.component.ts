import { Location } from "@angular/common";
import { ChangeDetectorRef, Component, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { SendComponent as BaseSendComponent } from "@bitwarden/angular/components/send/send.component";
import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { SendService } from "@bitwarden/common/abstractions/send.service";
import { SendType } from "@bitwarden/common/enums/sendType";
import { SendView } from "@bitwarden/common/models/view/sendView";

import { BrowserComponentState } from "../../models/browserComponentState";
import { StateService } from "../../services/abstractions/state.service";
import { PopupUtilsService } from "../services/popup-utils.service";

const ComponentId = "SendTypeComponent";

@Component({
  selector: "app-send-type",
  templateUrl: "send-type.component.html",
})
export class SendTypeComponent extends BaseSendComponent {
  groupingTitle: string;
  // State Handling
  state: BrowserComponentState;
  private refreshTimeout: number;
  private applySavedState = true;

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
    private route: ActivatedRoute,
    private location: Location,
    private changeDetectorRef: ChangeDetectorRef,
    private broadcasterService: BroadcasterService,
    private router: Router,
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
      this.selectType(this.type);
    };
    this.applySavedState =
      (window as any).previousPopupUrl != null &&
      !(window as any).previousPopupUrl.startsWith("/send-type");
  }

  async ngOnInit() {
    // Let super class finish
    await super.ngOnInit();
    this.route.queryParams.pipe(first()).subscribe(async (params) => {
      if (this.applySavedState) {
        this.state = await this.stateService.getBrowserSendTypeComponentState();
        if (this.state?.searchText != null) {
          this.searchText = this.state.searchText;
        }
      }

      if (params.type != null) {
        this.type = parseInt(params.type, null);
        switch (this.type) {
          case SendType.Text:
            this.groupingTitle = this.i18nService.t("sendTypeText");
            break;
          case SendType.File:
            this.groupingTitle = this.i18nService.t("sendTypeFile");
            break;
          default:
            break;
        }
        await this.load((s) => s.type === this.type);
      }

      // Restore state and remove reference
      if (this.applySavedState && this.state != null) {
        window.setTimeout(() => this.popupUtils.setContentScrollY(window, this.state?.scrollY), 0);
      }
      this.stateService.setBrowserSendTypeComponentState(null);
    });

    // Refresh Send list if sync completed in background
    this.broadcasterService.subscribe(ComponentId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "syncCompleted":
            if (message.successfully) {
              this.refreshTimeout = window.setTimeout(() => {
                this.refresh();
              }, 500);
            }
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
    if (this.refreshTimeout != null) {
      window.clearTimeout(this.refreshTimeout);
    }
    // Save state
    this.saveState();
    // Unsubscribe
    this.broadcasterService.unsubscribe(ComponentId);
  }

  async selectSend(s: SendView) {
    this.router.navigate(["/edit-send"], { queryParams: { sendId: s.id } });
  }

  async addSend() {
    if (this.disableSend) {
      return;
    }
    this.router.navigate(["/add-send"], { queryParams: { type: this.type } });
  }

  async removePassword(s: SendView): Promise<boolean> {
    if (this.disableSend) {
      return;
    }
    super.removePassword(s);
  }

  back() {
    (window as any).routeDirection = "b";
    this.location.back();
  }

  private async saveState() {
    this.state = {
      scrollY: this.popupUtils.getContentScrollY(window),
      searchText: this.searchText,
    };
    await this.stateService.setBrowserSendTypeComponentState(this.state);
  }
}
