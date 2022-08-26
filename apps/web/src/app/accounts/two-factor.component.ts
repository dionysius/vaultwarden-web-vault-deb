import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { TwoFactorComponent as BaseTwoFactorComponent } from "@bitwarden/angular/components/two-factor.component";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AppIdService } from "@bitwarden/common/abstractions/appId.service";
import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TwoFactorService } from "@bitwarden/common/abstractions/twoFactor.service";
import { TwoFactorProviderType } from "@bitwarden/common/enums/twoFactorProviderType";

import { RouterService } from "../core";

import { TwoFactorOptionsComponent } from "./two-factor-options.component";

@Component({
  selector: "app-two-factor",
  templateUrl: "two-factor.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class TwoFactorComponent extends BaseTwoFactorComponent {
  @ViewChild("twoFactorOptions", { read: ViewContainerRef, static: true })
  twoFactorOptionsModal: ViewContainerRef;

  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    apiService: ApiService,
    platformUtilsService: PlatformUtilsService,
    stateService: StateService,
    environmentService: EnvironmentService,
    private modalService: ModalService,
    route: ActivatedRoute,
    logService: LogService,
    twoFactorService: TwoFactorService,
    appIdService: AppIdService,
    private routerService: RouterService
  ) {
    super(
      authService,
      router,
      i18nService,
      apiService,
      platformUtilsService,
      window,
      environmentService,
      stateService,
      route,
      logService,
      twoFactorService,
      appIdService
    );
    this.onSuccessfulLoginNavigate = this.goAfterLogIn;
  }

  async anotherMethod() {
    const [modal] = await this.modalService.openViewRef(
      TwoFactorOptionsComponent,
      this.twoFactorOptionsModal,
      (comp) => {
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
        comp.onProviderSelected.subscribe(async (provider: TwoFactorProviderType) => {
          modal.close();
          this.selectedProviderType = provider;
          await this.init();
        });
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onRecoverSelected.subscribe(() => {
          modal.close();
        });
      }
    );
  }

  async goAfterLogIn() {
    const previousUrl = this.routerService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      this.router.navigate([this.successRoute], {
        queryParams: {
          identifier: this.identifier,
        },
      });
    }
  }
}
