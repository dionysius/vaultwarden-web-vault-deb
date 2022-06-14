import { Injectable } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService as LogServiceAbstraction } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { ThemeType } from "@bitwarden/common/enums/themeType";

import { StateService as StateServiceAbstraction } from "../../services/abstractions/state.service";

import { PopupUtilsService } from "./popup-utils.service";

@Injectable()
export class InitService {
  constructor(
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private popupUtilsService: PopupUtilsService,
    private stateService: StateServiceAbstraction,
    private logService: LogServiceAbstraction
  ) {}

  init() {
    return async () => {
      await this.stateService.init();

      if (!this.popupUtilsService.inPopup(window)) {
        window.document.body.classList.add("body-full");
      } else if (window.screen.availHeight < 600) {
        window.document.body.classList.add("body-xs");
      } else if (window.screen.availHeight <= 800) {
        window.document.body.classList.add("body-sm");
      }

      const htmlEl = window.document.documentElement;
      const theme = await this.platformUtilsService.getEffectiveTheme();
      htmlEl.classList.add("theme_" + theme);
      this.platformUtilsService.onDefaultSystemThemeChange(async (sysTheme) => {
        const bwTheme = await this.stateService.getTheme();
        if (bwTheme == null || bwTheme === ThemeType.System) {
          htmlEl.classList.remove("theme_" + ThemeType.Light, "theme_" + ThemeType.Dark);
          htmlEl.classList.add("theme_" + sysTheme);
        }
      });
      htmlEl.classList.add("locale_" + this.i18nService.translationLocale);

      // Workaround for slow performance on external monitors on Chrome + MacOS
      // See: https://bugs.chromium.org/p/chromium/issues/detail?id=971701#c64
      if (
        this.platformUtilsService.isChrome() &&
        navigator.platform.indexOf("Mac") > -1 &&
        this.popupUtilsService.inPopup(window) &&
        (window.screenLeft < 0 ||
          window.screenTop < 0 ||
          window.screenLeft > window.screen.width ||
          window.screenTop > window.screen.height)
      ) {
        htmlEl.classList.add("force_redraw");
        this.logService.info("Force redraw is on");
      }
    };
  }
}
