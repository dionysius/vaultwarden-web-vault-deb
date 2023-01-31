import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { TwoFactorComponent as BaseTwoFactorComponent } from "@bitwarden/angular/components/two-factor.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AppIdService } from "@bitwarden/common/abstractions/appId.service";
import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { LoginService } from "@bitwarden/common/abstractions/login.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TwoFactorService } from "@bitwarden/common/abstractions/twoFactor.service";
import { TwoFactorProviderType } from "@bitwarden/common/enums/twoFactorProviderType";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { BrowserApi } from "../../browser/browserApi";
import { PopupUtilsService } from "../services/popup-utils.service";

const BroadcasterSubscriptionId = "TwoFactorComponent";

@Component({
  selector: "app-two-factor",
  templateUrl: "two-factor.component.html",
})
export class TwoFactorComponent extends BaseTwoFactorComponent {
  showNewWindowMessage = false;

  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    apiService: ApiService,
    platformUtilsService: PlatformUtilsService,
    private syncService: SyncService,
    environmentService: EnvironmentService,
    private broadcasterService: BroadcasterService,
    private popupUtilsService: PopupUtilsService,
    stateService: StateService,
    route: ActivatedRoute,
    private messagingService: MessagingService,
    logService: LogService,
    twoFactorService: TwoFactorService,
    appIdService: AppIdService,
    loginService: LoginService
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
      appIdService,
      loginService
    );
    super.onSuccessfulLogin = () => {
      this.loginService.clearValues();
      return syncService.fullSync(true);
    };
    super.successRoute = "/tabs/vault";
    this.webAuthnNewTab =
      this.platformUtilsService.isFirefox() || this.platformUtilsService.isSafari();
  }

  async ngOnInit() {
    if (this.route.snapshot.paramMap.has("webAuthnResponse")) {
      // WebAuthn fallback response
      this.selectedProviderType = TwoFactorProviderType.WebAuthn;
      this.token = this.route.snapshot.paramMap.get("webAuthnResponse");
      super.onSuccessfulLogin = async () => {
        this.syncService.fullSync(true);
        this.messagingService.send("reloadPopup");
        window.close();
      };
      this.remember = this.route.snapshot.paramMap.get("remember") === "true";
      await this.doSubmit();
      return;
    }

    await super.ngOnInit();
    if (this.selectedProviderType == null) {
      return;
    }

    // WebAuthn prompt appears inside the popup on linux, and requires a larger popup width
    // than usual to avoid cutting off the dialog.
    if (this.selectedProviderType === TwoFactorProviderType.WebAuthn && (await this.isLinux())) {
      document.body.classList.add("linux-webauthn");
    }

    if (
      this.selectedProviderType === TwoFactorProviderType.Email &&
      this.popupUtilsService.inPopup(window)
    ) {
      const confirmed = await this.platformUtilsService.showDialog(
        this.i18nService.t("popup2faCloseMessage"),
        null,
        this.i18nService.t("yes"),
        this.i18nService.t("no")
      );
      if (confirmed) {
        this.popupUtilsService.popOut(window);
      }
    }

    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.sso === "true") {
        super.onSuccessfulLogin = () => {
          BrowserApi.reloadOpenWindows();
          const thisWindow = window.open("", "_self");
          thisWindow.close();
          return this.syncService.fullSync(true);
        };
      }
    });
  }

  async ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);

    if (this.selectedProviderType === TwoFactorProviderType.WebAuthn && (await this.isLinux())) {
      document.body.classList.remove("linux-webauthn");
    }
    super.ngOnDestroy();
  }

  anotherMethod() {
    this.router.navigate(["2fa-options"]);
  }

  async isLinux() {
    return (await BrowserApi.getPlatformInfo()).os === "linux";
  }
}
