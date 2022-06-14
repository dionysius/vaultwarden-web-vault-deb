import { Component, NgZone } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { getCookie } from "@bitwarden/electron/utils";

const BroadcasterSubscriptionId = "AccessibilityCookieComponent";

@Component({
  selector: "app-accessibility-cookie",
  templateUrl: "accessibility-cookie.component.html",
})
export class AccessibilityCookieComponent {
  listenForCookie = false;
  hCaptchaWindow: Window;

  accessibilityForm = new FormGroup({
    link: new FormControl("", Validators.required),
  });

  constructor(
    protected router: Router,
    protected platformUtilsService: PlatformUtilsService,
    protected environmentService: EnvironmentService,
    protected i18nService: I18nService,
    private broadcasterService: BroadcasterService,
    protected ngZone: NgZone
  ) {}

  async ngOnInit() {
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
      this.ngZone.run(() => {
        switch (message.command) {
          case "windowIsFocused":
            if (this.listenForCookie) {
              this.listenForCookie = false;
              this.checkForCookie();
            }
            break;
          default:
        }
      });
    });
  }

  registerhCaptcha() {
    this.platformUtilsService.launchUri("https://www.hcaptcha.com/accessibility");
  }

  async checkForCookie() {
    this.hCaptchaWindow.close();
    const [cookie] = await getCookie("https://www.hcaptcha.com/", "hc_accessibility");
    if (cookie) {
      this.onCookieSavedSuccess();
    } else {
      this.onCookieSavedFailure();
    }
  }

  onCookieSavedSuccess() {
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("accessibilityCookieSaved")
    );
  }

  onCookieSavedFailure() {
    this.platformUtilsService.showToast(
      "error",
      null,
      this.i18nService.t("noAccessibilityCookieSaved")
    );
  }

  async submit() {
    if (Utils.getDomain(this.accessibilityForm.value.link) !== "accounts.hcaptcha.com") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("invalidUrl")
      );
      return;
    }
    this.listenForCookie = true;
    this.hCaptchaWindow = window.open(this.accessibilityForm.value.link);
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }
}
