import { Injectable } from "@angular/core";

import { AbstractThemingService } from "@bitwarden/angular/platform/services/theming/theming.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService as LogServiceAbstraction } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ConfigService } from "@bitwarden/common/platform/services/config/config.service";

import BrowserPopupUtils from "../../platform/popup/browser-popup-utils";
import { BrowserStateService as StateServiceAbstraction } from "../../platform/services/abstractions/browser-state.service";

@Injectable()
export class InitService {
  constructor(
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private stateService: StateServiceAbstraction,
    private logService: LogServiceAbstraction,
    private themingService: AbstractThemingService,
    private configService: ConfigService,
  ) {}

  init() {
    return async () => {
      await this.stateService.init();

      if (!BrowserPopupUtils.inPopup(window)) {
        window.document.body.classList.add("body-full");
      } else if (window.screen.availHeight < 600) {
        window.document.body.classList.add("body-xs");
      } else if (window.screen.availHeight <= 800) {
        window.document.body.classList.add("body-sm");
      }

      const htmlEl = window.document.documentElement;
      await this.themingService.monitorThemeChanges();
      htmlEl.classList.add("locale_" + this.i18nService.translationLocale);

      // Workaround for slow performance on external monitors on Chrome + MacOS
      // See: https://bugs.chromium.org/p/chromium/issues/detail?id=971701#c64
      if (
        this.platformUtilsService.isChrome() &&
        navigator.platform.indexOf("Mac") > -1 &&
        BrowserPopupUtils.inPopup(window) &&
        (window.screenLeft < 0 ||
          window.screenTop < 0 ||
          window.screenLeft > window.screen.width ||
          window.screenTop > window.screen.height)
      ) {
        htmlEl.classList.add("force_redraw");
        this.logService.info("Force redraw is on");
      }

      this.configService.init();
    };
  }
}
