import { Component, OnInit } from "@angular/core";

import { SettingsService } from "@bitwarden/common/abstractions/settings.service";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { UriMatchType } from "@bitwarden/common/vault/enums";
import { DialogService } from "@bitwarden/components";

import { BrowserApi } from "../../../platform/browser/browser-api";
import { enableAccountSwitching } from "../../../platform/flags";
import { AutofillService } from "../../services/abstractions/autofill.service";
import { AutofillOverlayVisibility } from "../../utils/autofill-overlay.enum";

@Component({
  selector: "app-autofill",
  templateUrl: "autofill.component.html",
})
export class AutofillComponent implements OnInit {
  protected canOverrideBrowserAutofillSetting = false;
  protected defaultBrowserAutofillDisabled = false;
  protected autoFillOverlayVisibility: number;
  protected autoFillOverlayVisibilityOptions: any[];
  protected disablePasswordManagerLink: string;
  enableAutoFillOnPageLoad = false;
  autoFillOnPageLoadDefault = false;
  autoFillOnPageLoadOptions: any[];
  defaultUriMatch = UriMatchType.Domain;
  uriMatchOptions: any[];
  autofillKeyboardHelperText: string;
  accountSwitcherEnabled = false;

  constructor(
    private stateService: StateService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private configService: ConfigServiceAbstraction,
    private settingsService: SettingsService,
    private autofillService: AutofillService,
    private dialogService: DialogService,
  ) {
    this.autoFillOverlayVisibilityOptions = [
      {
        name: i18nService.t("autofillOverlayVisibilityOff"),
        value: AutofillOverlayVisibility.Off,
      },
      {
        name: i18nService.t("autofillOverlayVisibilityOnFieldFocus"),
        value: AutofillOverlayVisibility.OnFieldFocus,
      },
      {
        name: i18nService.t("autofillOverlayVisibilityOnButtonClick"),
        value: AutofillOverlayVisibility.OnButtonClick,
      },
    ];
    this.autoFillOnPageLoadOptions = [
      { name: i18nService.t("autoFillOnPageLoadYes"), value: true },
      { name: i18nService.t("autoFillOnPageLoadNo"), value: false },
    ];
    this.uriMatchOptions = [
      { name: i18nService.t("baseDomain"), value: UriMatchType.Domain },
      { name: i18nService.t("host"), value: UriMatchType.Host },
      { name: i18nService.t("startsWith"), value: UriMatchType.StartsWith },
      { name: i18nService.t("regEx"), value: UriMatchType.RegularExpression },
      { name: i18nService.t("exact"), value: UriMatchType.Exact },
      { name: i18nService.t("never"), value: UriMatchType.Never },
    ];

    this.accountSwitcherEnabled = enableAccountSwitching();
    this.disablePasswordManagerLink = this.getDisablePasswordManagerLink();
  }

  async ngOnInit() {
    this.canOverrideBrowserAutofillSetting =
      this.platformUtilsService.isChrome() ||
      this.platformUtilsService.isEdge() ||
      this.platformUtilsService.isOpera() ||
      this.platformUtilsService.isVivaldi();

    this.defaultBrowserAutofillDisabled = await this.browserAutofillSettingCurrentlyOverridden();

    this.autoFillOverlayVisibility =
      (await this.settingsService.getAutoFillOverlayVisibility()) || AutofillOverlayVisibility.Off;

    this.enableAutoFillOnPageLoad = await this.stateService.getEnableAutoFillOnPageLoad();
    this.autoFillOnPageLoadDefault =
      (await this.stateService.getAutoFillOnPageLoadDefault()) ?? true;

    const defaultUriMatch = await this.stateService.getDefaultUriMatch();
    this.defaultUriMatch = defaultUriMatch == null ? UriMatchType.Domain : defaultUriMatch;

    const command = await this.platformUtilsService.getAutofillKeyboardShortcut();
    await this.setAutofillKeyboardHelperText(command);
  }

  async updateAutoFillOverlayVisibility() {
    const previousAutoFillOverlayVisibility =
      await this.settingsService.getAutoFillOverlayVisibility();
    await this.settingsService.setAutoFillOverlayVisibility(this.autoFillOverlayVisibility);
    await this.handleUpdatingAutofillOverlayContentScripts(previousAutoFillOverlayVisibility);
    await this.requestPrivacyPermission();
  }

  async updateAutoFillOnPageLoad() {
    await this.stateService.setEnableAutoFillOnPageLoad(this.enableAutoFillOnPageLoad);
  }

  async updateAutoFillOnPageLoadDefault() {
    await this.stateService.setAutoFillOnPageLoadDefault(this.autoFillOnPageLoadDefault);
  }

  async saveDefaultUriMatch() {
    await this.stateService.setDefaultUriMatch(this.defaultUriMatch);
  }

  private async setAutofillKeyboardHelperText(command: string) {
    if (command) {
      this.autofillKeyboardHelperText = this.i18nService.t("autofillShortcutText", command);
    } else {
      this.autofillKeyboardHelperText = this.i18nService.t("autofillShortcutNotSet");
    }
  }

  async commandSettings() {
    if (this.platformUtilsService.isChrome()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.createNewTab("chrome://extensions/shortcuts");
    } else if (this.platformUtilsService.isOpera()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.createNewTab("opera://extensions/shortcuts");
    } else if (this.platformUtilsService.isEdge()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.createNewTab("edge://extensions/shortcuts");
    } else if (this.platformUtilsService.isVivaldi()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.createNewTab("vivaldi://extensions/shortcuts");
    } else {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.createNewTab("https://bitwarden.com/help/keyboard-shortcuts");
    }
  }

  private getDisablePasswordManagerLink(): string {
    if (this.platformUtilsService.isChrome()) {
      return "chrome://settings/autofill";
    }
    if (this.platformUtilsService.isOpera()) {
      return "opera://settings/autofill";
    }
    if (this.platformUtilsService.isEdge()) {
      return "edge://settings/passwords";
    }
    if (this.platformUtilsService.isVivaldi()) {
      return "vivaldi://settings/autofill";
    }

    return "https://bitwarden.com/help/disable-browser-autofill/";
  }

  protected openDisablePasswordManagerLink(event: Event) {
    event.preventDefault();
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab(this.disablePasswordManagerLink);
  }

  private async handleUpdatingAutofillOverlayContentScripts(
    previousAutoFillOverlayVisibility: number,
  ) {
    const autofillOverlayPreviouslyDisabled =
      previousAutoFillOverlayVisibility === AutofillOverlayVisibility.Off;
    const autofillOverlayCurrentlyDisabled =
      this.autoFillOverlayVisibility === AutofillOverlayVisibility.Off;

    if (!autofillOverlayPreviouslyDisabled && !autofillOverlayCurrentlyDisabled) {
      const tabs = await BrowserApi.tabsQuery({});
      tabs.forEach((tab) =>
        BrowserApi.tabSendMessageData(tab, "updateAutofillOverlayVisibility", {
          autofillOverlayVisibility: this.autoFillOverlayVisibility,
        }),
      );
      return;
    }

    await this.autofillService.reloadAutofillScripts();
  }

  async requestPrivacyPermission() {
    if (
      this.autoFillOverlayVisibility === AutofillOverlayVisibility.Off ||
      !this.canOverrideBrowserAutofillSetting ||
      (await this.browserAutofillSettingCurrentlyOverridden())
    ) {
      return;
    }

    const permissionGranted = await this.privacyPermissionGranted();
    const contentKey = permissionGranted
      ? "overrideDefaultBrowserAutofillDescription"
      : "overrideDefaultBrowserAutofillPrivacyRequiredDescription";
    await this.dialogService.openSimpleDialog({
      title: { key: "overrideDefaultBrowserAutofillTitle" },
      content: { key: contentKey },
      acceptButtonText: { key: "makeDefault" },
      acceptAction: async () => await this.handleOverrideDialogAccept(),
      cancelButtonText: { key: "ignore" },
      type: "info",
    });
  }

  async updateDefaultBrowserAutofillDisabled() {
    const privacyPermissionGranted = await this.privacyPermissionGranted();
    if (!this.defaultBrowserAutofillDisabled && !privacyPermissionGranted) {
      return;
    }

    if (
      !privacyPermissionGranted &&
      !(await BrowserApi.requestPermission({ permissions: ["privacy"] }))
    ) {
      await this.dialogService.openSimpleDialog({
        title: { key: "privacyPermissionAdditionNotGrantedTitle" },
        content: { key: "privacyPermissionAdditionNotGrantedDescription" },
        acceptButtonText: { key: "ok" },
        cancelButtonText: null,
        type: "warning",
      });
      this.defaultBrowserAutofillDisabled = false;

      return;
    }

    BrowserApi.updateDefaultBrowserAutofillSettings(!this.defaultBrowserAutofillDisabled);
  }

  private handleOverrideDialogAccept = async () => {
    this.defaultBrowserAutofillDisabled = true;
    await this.updateDefaultBrowserAutofillDisabled();
  };

  async browserAutofillSettingCurrentlyOverridden() {
    if (!this.canOverrideBrowserAutofillSetting) {
      return false;
    }

    if (!(await this.privacyPermissionGranted())) {
      return false;
    }

    return await BrowserApi.browserAutofillSettingsOverridden();
  }

  async privacyPermissionGranted(): Promise<boolean> {
    return await BrowserApi.permissionsGranted(["privacy"]);
  }
}
