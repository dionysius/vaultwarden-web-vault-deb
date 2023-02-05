import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { Router } from "@angular/router";

import { LoginWithDeviceComponent as BaseLoginWithDeviceComponent } from "@bitwarden/angular/components/login-with-device.component";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AnonymousHubService } from "@bitwarden/common/abstractions/anonymousHub.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AppIdService } from "@bitwarden/common/abstractions/appId.service";
import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { LoginService } from "@bitwarden/common/abstractions/login.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { EnvironmentComponent } from "../environment.component";

@Component({
  selector: "app-login-with-device",
  templateUrl: "login-with-device.component.html",
})
export class LoginWithDeviceComponent
  extends BaseLoginWithDeviceComponent
  implements OnInit, OnDestroy
{
  @ViewChild("environment", { read: ViewContainerRef, static: true })
  environmentModal: ViewContainerRef;
  showingModal = false;

  constructor(
    protected router: Router,
    cryptoService: CryptoService,
    cryptoFunctionService: CryptoFunctionService,
    appIdService: AppIdService,
    passwordGenerationService: PasswordGenerationService,
    apiService: ApiService,
    authService: AuthService,
    logService: LogService,
    environmentService: EnvironmentService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    anonymousHubService: AnonymousHubService,
    validationService: ValidationService,
    private modalService: ModalService,
    syncService: SyncService,
    stateService: StateService,
    loginService: LoginService
  ) {
    super(
      router,
      cryptoService,
      cryptoFunctionService,
      appIdService,
      passwordGenerationService,
      apiService,
      authService,
      logService,
      environmentService,
      i18nService,
      platformUtilsService,
      anonymousHubService,
      validationService,
      stateService,
      loginService
    );

    super.onSuccessfulLogin = () => {
      return syncService.fullSync(true);
    };
  }

  async settings() {
    const [modal, childComponent] = await this.modalService.openViewRef(
      EnvironmentComponent,
      this.environmentModal
    );

    // eslint-disable-next-line rxjs-angular/prefer-takeuntil
    modal.onShown.subscribe(() => {
      this.showingModal = true;
    });
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil
    modal.onClosed.subscribe(() => {
      this.showingModal = false;
    });

    // eslint-disable-next-line rxjs-angular/prefer-takeuntil
    childComponent.onSaved.subscribe(() => {
      modal.close();
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  goToLogin() {
    this.router.navigate(["/login"]);
  }
}
