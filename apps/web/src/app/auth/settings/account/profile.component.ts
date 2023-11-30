import { ViewChild, ViewContainerRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { UpdateProfileRequest } from "@bitwarden/common/auth/models/request/update-profile.request";
import { ProfileResponse } from "@bitwarden/common/models/response/profile.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

import { ChangeAvatarComponent } from "./change-avatar.component";

@Component({
  selector: "app-profile",
  templateUrl: "profile.component.html",
})
export class ProfileComponent implements OnInit, OnDestroy {
  loading = true;
  profile: ProfileResponse;
  fingerprintMaterial: string;

  formPromise: Promise<any>;
  @ViewChild("avatarModalTemplate", { read: ViewContainerRef, static: true })
  avatarModalRef: ViewContainerRef;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private stateService: StateService,
    private modalService: ModalService,
  ) {}

  async ngOnInit() {
    this.profile = await this.apiService.getProfile();
    this.loading = false;
    this.fingerprintMaterial = await this.stateService.getUserId();
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
      },
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
