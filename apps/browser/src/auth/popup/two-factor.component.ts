import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { TwoFactorComponent as BaseTwoFactorComponent } from "@bitwarden/angular/auth/components/two-factor.component";
import { DialogServiceAbstraction, SimpleDialogType } from "@bitwarden/angular/services/dialog";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AppIdService } from "@bitwarden/common/abstractions/appId.service";
import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { BrowserApi } from "../../browser/browserApi";
import { PopupUtilsService } from "../../popup/services/popup-utils.service";

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
    loginService: LoginService,
    private dialogService: DialogServiceAbstraction
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
    // FIXME: Chromium 110 has broken WebAuthn support in extensions via an iframe
    this.webAuthnNewTab = true;
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
      const confirmed = await this.dialogService.openSimpleDialog({
        title: { key: "warning" },
        content: { key: "popup2faCloseMessage" },
        type: SimpleDialogType.WARNING,
      });
      if (confirmed) {
        this.popupUtilsService.popOut(window);
      }
    }

    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.sso === "true") {
        super.onSuccessfulLogin = () => {
          // This is not awaited so we don't pause the application while the sync is happening.
          // This call is executed by the service that lives in the background script so it will continue
          // the sync even if this tab closes.
          const syncPromise = this.syncService.fullSync(true);

          // Force sidebars (FF && Opera) to reload while exempting current window
          // because we are just going to close the current window.
          BrowserApi.reloadOpenWindows(true);

          // We don't need this window anymore because the intent is for the user to be left
          // on the web vault screen which tells them to continue in the browser extension (sidebar or popup)
          BrowserApi.closeBitwardenExtensionTab();

          return syncPromise;
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
    const sso = this.route.snapshot.queryParamMap.get("sso") === "true";

    if (sso) {
      // We must persist this so when the user returns to the 2FA comp, the
      // proper onSuccessfulLogin logic is executed.
      this.router.navigate(["2fa-options"], { queryParams: { sso: true } });
    } else {
      this.router.navigate(["2fa-options"]);
    }
  }

  async isLinux() {
    return (await BrowserApi.getPlatformInfo()).os === "linux";
  }
}
