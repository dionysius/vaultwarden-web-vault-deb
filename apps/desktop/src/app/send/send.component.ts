import { Component, NgZone, OnDestroy, OnInit, ViewChild } from "@angular/core";

import { SendComponent as BaseSendComponent } from "@bitwarden/angular/components/send/send.component";
import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { SendService } from "@bitwarden/common/abstractions/send.service";
import { SendView } from "@bitwarden/common/models/view/send.view";

import { invokeMenu, RendererMenuItem } from "../../utils";
import { SearchBarService } from "../layout/search/search-bar.service";

import { AddEditComponent } from "./add-edit.component";

enum Action {
  None = "",
  Add = "add",
  Edit = "edit",
}

const BroadcasterSubscriptionId = "SendComponent";

@Component({
  selector: "app-send",
  templateUrl: "send.component.html",
})
export class SendComponent extends BaseSendComponent implements OnInit, OnDestroy {
  @ViewChild(AddEditComponent) addEditComponent: AddEditComponent;

  sendId: string;
  action: Action = Action.None;

  constructor(
    sendService: SendService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    environmentService: EnvironmentService,
    private broadcasterService: BroadcasterService,
    ngZone: NgZone,
    searchService: SearchService,
    policyService: PolicyService,
    private searchBarService: SearchBarService,
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
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil
    this.searchBarService.searchText$.subscribe((searchText) => {
      this.searchText = searchText;
      this.searchTextChanged();
    });
  }

  async ngOnInit() {
    this.searchBarService.setEnabled(true);
    this.searchBarService.setPlaceholderText(this.i18nService.t("searchSends"));

    super.ngOnInit();
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "syncCompleted":
            await this.load();
            break;
        }
      });
    });
    await this.load();
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    this.searchBarService.setEnabled(false);
  }

  addSend() {
    this.action = Action.Add;
    if (this.addEditComponent != null) {
      this.addEditComponent.sendId = null;
      this.addEditComponent.send = null;
      this.addEditComponent.load();
    }
  }

  cancel(s: SendView) {
    this.action = Action.None;
    this.sendId = null;
  }

  async deletedSend(s: SendView) {
    await this.refresh();
    this.action = Action.None;
    this.sendId = null;
  }

  async savedSend(s: SendView) {
    await this.refresh();
    this.selectSend(s.id);
  }

  async selectSend(sendId: string) {
    if (sendId === this.sendId && this.action === Action.Edit) {
      return;
    }
    this.action = Action.Edit;
    this.sendId = sendId;
    if (this.addEditComponent != null) {
      this.addEditComponent.sendId = sendId;
      await this.addEditComponent.refresh();
    }
  }

  get selectedSendType() {
    return this.sends.find((s) => s.id === this.sendId)?.type;
  }

  viewSendMenu(send: SendView) {
    const menu: RendererMenuItem[] = [];
    menu.push({
      label: this.i18nService.t("copyLink"),
      click: () => this.copy(send),
    });
    if (send.password && !send.disabled) {
      menu.push({
        label: this.i18nService.t("removePassword"),
        click: async () => {
          await this.removePassword(send);
          if (this.sendId === send.id) {
            this.sendId = null;
            this.selectSend(send.id);
          }
        },
      });
    }
    menu.push({
      label: this.i18nService.t("delete"),
      click: async () => {
        await this.delete(send);
        await this.deletedSend(send);
      },
    });

    invokeMenu(menu);
  }
}
