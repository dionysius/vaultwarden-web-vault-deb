import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SsoComponent as BaseSsoComponent } from "@bitwarden/angular/components/sso.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

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
