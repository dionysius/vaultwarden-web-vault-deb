import { shell, MenuItemConstructorOptions } from "electron";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { isMacAppStore, isWindowsStore } from "../../utils";

import { AboutMenu } from "./menu.about";
import { IMenubarMenu } from "./menubar";

export class HelpMenu implements IMenubarMenu {
  readonly id: string = "help";

  get label(): string {
    return this.localize("help");
  }

  get items(): MenuItemConstructorOptions[] {
    const items = [
      this.helpAndFeedback,
      this.fileBugReport,
      this.legal,
      this.separator,
      this.followUs,
      this.separator,
      this.goToWebVault,
      this.separator,
      this.getMobileApp,
      this.getBrowserExtension,
    ];

    if (this._aboutMenu != null) {
      items.push(...this._aboutMenu.items);
    }
    return items;
  }

  private readonly _i18nService: I18nService;
  private readonly _webVaultUrl: string;
  private readonly _aboutMenu: AboutMenu;

  constructor(i18nService: I18nService, webVaultUrl: string, aboutMenu: AboutMenu) {
    this._i18nService = i18nService;
    this._webVaultUrl = webVaultUrl;
    this._aboutMenu = aboutMenu;
  }

  private get helpAndFeedback(): MenuItemConstructorOptions {
    return {
      id: "helpAndFeedback",
      label: this.localize("helpAndFeedback"),
      click: () => shell.openExternal("https://bitwarden.com/help"),
    };
  }

  private get fileBugReport(): MenuItemConstructorOptions {
    return {
      id: "fileBugReport",
      label: this.localize("fileBugReport"),
      click: () => shell.openExternal("https://github.com/bitwarden/clients/issues"),
    };
  }

  private get legal(): MenuItemConstructorOptions {
    return {
      id: "legal",
      label: this.localize("legal"),
      visible: isMacAppStore(),
      submenu: this.legalSubmenu,
    };
  }

  private get legalSubmenu(): MenuItemConstructorOptions[] {
    return [
      {
        id: "termsOfService",
        label: this.localize("termsOfService"),
        click: () => shell.openExternal("https://bitwarden.com/terms/"),
      },
      {
        id: "privacyPolicy",
        label: this.localize("privacyPolicy"),
        click: () => shell.openExternal("https://bitwarden.com/privacy/"),
      },
    ];
  }

  private get separator(): MenuItemConstructorOptions {
    return { type: "separator" };
  }

  private get followUs(): MenuItemConstructorOptions {
    return {
      id: "followUs",
      label: this.localize("followUs"),
      submenu: this.followUsSubmenu,
    };
  }

  private get followUsSubmenu(): MenuItemConstructorOptions[] {
    return [
      {
        id: "blog",
        label: this.localize("blog"),
        click: () => shell.openExternal("https://blog.bitwarden.com"),
      },
      {
        id: "twitter",
        label: "Twitter",
        click: () => shell.openExternal("https://twitter.com/bitwarden"),
      },
      {
        id: "facebook",
        label: "Facebook",
        click: () => shell.openExternal("https://www.facebook.com/bitwarden/"),
      },
      {
        id: "github",
        label: "GitHub",
        click: () => shell.openExternal("https://github.com/bitwarden"),
      },
      {
        id: "mastodon",
        label: "Mastodon",
        click: () => shell.openExternal("https://fosstodon.org/@bitwarden"),
      },
    ];
  }

  private get goToWebVault(): MenuItemConstructorOptions {
    return {
      id: "goToWebVault",
      label: this.localize("goToWebVault"),
      click: () => shell.openExternal(this._webVaultUrl),
    };
  }

  private get getMobileApp(): MenuItemConstructorOptions {
    return {
      id: "getMobileApp",
      label: this.localize("getMobileApp"),
      visible: !isWindowsStore(),
      submenu: this.getMobileAppSubmenu,
    };
  }

  private get getMobileAppSubmenu(): MenuItemConstructorOptions[] {
    return [
      {
        id: "iOS",
        label: "iOS",
        click: () => {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal(
            "https://itunes.apple.com/app/" + "bitwarden-free-password-manager/id1137397744?mt=8",
          );
        },
      },
      {
        id: "android",
        label: "Android",
        visible: !isMacAppStore(), // Apple Guideline 2.3.10 - Accurate Metadata
        click: () => {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal(
            "https://play.google.com/store/apps/" + "details?id=com.x8bit.bitwarden",
          );
        },
      },
    ];
  }

  private get getBrowserExtension(): MenuItemConstructorOptions {
    return {
      id: "getBrowserExtension",
      label: this.localize("getBrowserExtension"),
      visible: !isWindowsStore(),
      submenu: this.getBrowserExtensionSubmenu,
    };
  }

  private get getBrowserExtensionSubmenu(): MenuItemConstructorOptions[] {
    return [
      {
        id: "chrome",
        label: "Chrome",
        click: () => {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal(
            "https://chromewebstore.google.com/detail/" +
              "bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb",
          );
        },
      },
      {
        id: "firefox",
        label: "Firefox",
        click: () => {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal(
            "https://addons.mozilla.org/firefox/addon/" + "bitwarden-password-manager/",
          );
        },
      },
      {
        id: "firefox",
        label: "Opera",
        click: () => {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal(
            "https://addons.opera.com/extensions/details/" + "bitwarden-free-password-manager/",
          );
        },
      },
      {
        id: "firefox",
        label: "Edge",
        click: () => {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal(
            "https://microsoftedge.microsoft.com/addons/" +
              "detail/jbkfoedolllekgbhcbcoahefnbanhhlh",
          );
        },
      },
      {
        id: "safari",
        label: "Safari",
        click: () => {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal("https://bitwarden.com/download/");
        },
      },
    ];
  }

  private localize(s: string) {
    return this._i18nService.t(s);
  }
}
