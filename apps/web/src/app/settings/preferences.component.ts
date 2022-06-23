import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

import { AbstractThemingService } from "@bitwarden/angular/services/theming/theming.service.abstraction";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout.service";
import { ThemeType } from "@bitwarden/common/enums/themeType";
import { Utils } from "@bitwarden/common/misc/utils";

@Component({
  selector: "app-preferences",
  templateUrl: "preferences.component.html",
})
export class PreferencesComponent implements OnInit {
  vaultTimeoutAction = "lock";
  enableFavicons: boolean;
  enableGravatars: boolean;
  enableFullWidth: boolean;
  theme: ThemeType;
  locale: string;
  vaultTimeouts: { name: string; value: number }[];
  localeOptions: any[];
  themeOptions: any[];

  vaultTimeout: FormControl = new FormControl(null);

  private startingLocale: string;
  private startingTheme: ThemeType;

  constructor(
    private stateService: StateService,
    private i18nService: I18nService,
    private vaultTimeoutService: VaultTimeoutService,
    private platformUtilsService: PlatformUtilsService,
    private messagingService: MessagingService,
    private themingService: AbstractThemingService
  ) {
    this.vaultTimeouts = [
      { name: i18nService.t("oneMinute"), value: 1 },
      { name: i18nService.t("fiveMinutes"), value: 5 },
      { name: i18nService.t("fifteenMinutes"), value: 15 },
      { name: i18nService.t("thirtyMinutes"), value: 30 },
      { name: i18nService.t("oneHour"), value: 60 },
      { name: i18nService.t("fourHours"), value: 240 },
      { name: i18nService.t("onRefresh"), value: -1 },
    ];
    if (this.platformUtilsService.isDev()) {
      this.vaultTimeouts.push({ name: i18nService.t("never"), value: null });
    }

    const localeOptions: any[] = [];
    i18nService.supportedTranslationLocales.forEach((locale) => {
      let name = locale;
      if (i18nService.localeNames.has(locale)) {
        name += " - " + i18nService.localeNames.get(locale);
      }
      localeOptions.push({ name: name, value: locale });
    });
    localeOptions.sort(Utils.getSortFunction(i18nService, "name"));
    localeOptions.splice(0, 0, { name: i18nService.t("default"), value: null });
    this.localeOptions = localeOptions;
    this.themeOptions = [
      { name: i18nService.t("themeLight"), value: ThemeType.Light },
      { name: i18nService.t("themeDark"), value: ThemeType.Dark },
      { name: i18nService.t("themeSystem"), value: ThemeType.System },
    ];
  }

  async ngOnInit() {
    this.vaultTimeout.setValue(await this.vaultTimeoutService.getVaultTimeout());
    this.vaultTimeoutAction = await this.stateService.getVaultTimeoutAction();
    this.enableFavicons = !(await this.stateService.getDisableFavicon());
    this.enableGravatars = await this.stateService.getEnableGravitars();
    this.enableFullWidth = await this.stateService.getEnableFullWidth();

    this.locale = (await this.stateService.getLocale()) ?? null;
    this.startingLocale = this.locale;

    this.theme = await this.stateService.getTheme();
    this.startingTheme = this.theme;
  }

  async submit() {
    if (!this.vaultTimeout.valid) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("vaultTimeoutRangeError")
      );
      return;
    }

    await this.vaultTimeoutService.setVaultTimeoutOptions(
      this.vaultTimeout.value,
      this.vaultTimeoutAction
    );
    await this.stateService.setDisableFavicon(!this.enableFavicons);
    await this.stateService.setEnableGravitars(this.enableGravatars);
    await this.stateService.setEnableFullWidth(this.enableFullWidth);
    this.messagingService.send("setFullWidth");
    if (this.theme !== this.startingTheme) {
      await this.themingService.updateConfiguredTheme(this.theme);
      this.startingTheme = this.theme;
    }
    await this.stateService.setLocale(this.locale);
    if (this.locale !== this.startingLocale) {
      window.location.reload();
    } else {
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("preferencesUpdated")
      );
    }
  }

  async vaultTimeoutActionChanged(newValue: string) {
    if (newValue === "logOut") {
      const confirmed = await this.platformUtilsService.showDialog(
        this.i18nService.t("vaultTimeoutLogOutConfirmation"),
        this.i18nService.t("vaultTimeoutLogOutConfirmationTitle"),
        this.i18nService.t("yes"),
        this.i18nService.t("cancel"),
        "warning"
      );
      if (!confirmed) {
        this.vaultTimeoutAction = "lock";
        return;
      }
    }
    this.vaultTimeoutAction = newValue;
  }
}
