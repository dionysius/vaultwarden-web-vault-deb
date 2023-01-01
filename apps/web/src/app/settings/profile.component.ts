import { ViewChild, ViewContainerRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { UpdateProfileRequest } from "@bitwarden/common/models/request/update-profile.request";
import { ProfileResponse } from "@bitwarden/common/models/response/profile.response";

import { ChangeAvatarComponent } from "./change-avatar.component";

@Component({
  selector: "app-profile",
  templateUrl: "profile.component.html",
})
export class ProfileComponent implements OnInit, OnDestroy {
  loading = true;
  profile: ProfileResponse;
  fingerprint: string;

  formPromise: Promise<any>;
  @ViewChild("avatarModalTemplate", { read: ViewContainerRef, static: true })
  avatarModalRef: ViewContainerRef;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private logService: LogService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService,
    private modalService: ModalService
  ) {}

  async ngOnInit() {
    this.profile = await this.apiService.getProfile();
    this.loading = false;
    const fingerprint = await this.cryptoService.getFingerprint(
      await this.stateService.getUserId()
    );
    if (fingerprint != null) {
      this.fingerprint = fingerprint.join("-");
    }
  }

  async ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async openChangeAvatar() {
    const modalOpened = await this.modalService.openViewRef(
      ChangeAvatarComponent,
      this.avatarModalRef,
      (modal) => {
        modal.profile = this.profile;
        modal.changeColor.pipe(takeUntil(this.destroy$)).subscribe(() => {
          modalOpened[0].close();
        });
      }
    );
  }

  async submit() {
    try {
      const request = new UpdateProfileRequest(this.profile.name, this.profile.masterPasswordHint);
      this.formPromise = this.apiService.putProfile(request);
      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("accountUpdated"));
    } catch (e) {
      this.logService.error(e);
    }
  }
}
