import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SsoComponent as BaseSsoComponent } from "jslib-angular/components/sso.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { AuthService } from "jslib-common/abstractions/auth.service";
import { CryptoFunctionService } from "jslib-common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";
import { AuthenticationStatus } from "jslib-common/enums/authenticationStatus";

import { BrowserApi } from "../../browser/browserApi";

@Component({
  selector: "app-sso",
  templateUrl: "sso.component.html",
})
export class SsoComponent extends BaseSsoComponent {
  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    route: ActivatedRoute,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    apiService: ApiService,
    cryptoFunctionService: CryptoFunctionService,
    passwordGenerationService: PasswordGenerationService,
    syncService: SyncService,
    environmentService: EnvironmentService,
    logService: LogService,
    private vaultTimeoutService: VaultTimeoutService
  ) {
    super(
      authService,
      router,
      i18nService,
      route,
      stateService,
      platformUtilsService,
      apiService,
      cryptoFunctionService,
      environmentService,
      passwordGenerationService,
      logService
    );

    const url = this.environmentService.getWebVaultUrl();

    this.redirectUri = url + "/sso-connector.html";
    this.clientId = "browser";

    super.onSuccessfulLogin = async () => {
      await syncService.fullSync(true);

      // If the vault is unlocked then this will clear keys from memory, which we don't want to do
      if ((await this.authService.getAuthStatus()) !== AuthenticationStatus.Unlocked) {
        BrowserApi.reloadOpenWindows();
      }

      const thisWindow = window.open("", "_self");
      thisWindow.close();
    };
  }
}
