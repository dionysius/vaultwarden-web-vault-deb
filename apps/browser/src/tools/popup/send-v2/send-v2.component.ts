import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { ButtonModule, NoItemsModule } from "@bitwarden/components";
import {
  NoSendsIcon,
  NewSendDropdownComponent,
  SendListFiltersComponent,
} from "@bitwarden/send-ui";

import { CurrentAccountComponent } from "../../../auth/popup/account-switching/current-account.component";
import { PopOutComponent } from "../../../platform/popup/components/pop-out.component";
import { PopupHeaderComponent } from "../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../platform/popup/layout/popup-page.component";

enum SendsListState {
  Empty,
}

@Component({
  templateUrl: "send-v2.component.html",
  standalone: true,
  imports: [
    PopupPageComponent,
    PopupHeaderComponent,
    PopOutComponent,
    CurrentAccountComponent,
    NoItemsModule,
    JslibModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    NewSendDropdownComponent,
    SendListFiltersComponent,
  ],
})
export class SendV2Component implements OnInit, OnDestroy {
  sendType = SendType;

  /** Visual state of the Sends list */
  protected sendsListState: SendsListState | null = null;

  protected noItemIcon = NoSendsIcon;

  protected SendsListStateEnum = SendsListState;

  constructor() {
    this.sendsListState = SendsListState.Empty;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
