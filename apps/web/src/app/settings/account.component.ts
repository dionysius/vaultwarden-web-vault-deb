import { Component, ViewChild, ViewContainerRef } from "@angular/core";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";

import { DeauthorizeSessionsComponent } from "../../auth/settings/deauthorize-sessions.component";

import { DeleteAccountComponent } from "./delete-account.component";
import { PurgeVaultComponent } from "./purge-vault.component";

@Component({
  selector: "app-account",
  templateUrl: "account.component.html",
})
export class AccountComponent {
  @ViewChild("deauthorizeSessionsTemplate", { read: ViewContainerRef, static: true })
  deauthModalRef: ViewContainerRef;
  @ViewChild("purgeVaultTemplate", { read: ViewContainerRef, static: true })
  purgeModalRef: ViewContainerRef;
  @ViewChild("deleteAccountTemplate", { read: ViewContainerRef, static: true })
  deleteModalRef: ViewContainerRef;

  showChangeEmail = true;

  constructor(
    private modalService: ModalService,
    private apiService: ApiService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    this.showChangeEmail = !(await this.keyConnectorService.getUsesKeyConnector());
  }

  async deauthorizeSessions() {
    await this.modalService.openViewRef(DeauthorizeSessionsComponent, this.deauthModalRef);
  }

  async purgeVault() {
    await this.modalService.openViewRef(PurgeVaultComponent, this.purgeModalRef);
  }

  async deleteAccount() {
    await this.modalService.openViewRef(DeleteAccountComponent, this.deleteModalRef);
  }
}
