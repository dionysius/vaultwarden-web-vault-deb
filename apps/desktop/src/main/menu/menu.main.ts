import { app, Menu } from "electron";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { Main } from "../../main";
import { WindowMain } from "../window.main";

import { MenuUpdateRequest } from "./menu.updater";
import { Menubar } from "./menubar";

const cloudWebVaultUrl = "https://vault.bitwarden.com";

export class MenuMain {
  private i18nService: I18nService;
  private windowMain: WindowMain;

  constructor(private main: Main) {
    this.i18nService = main.i18nService;
    this.windowMain = main.windowMain;
  }

  async init() {
    this.initContextMenu();
    await this.setMenu();
  }

  async updateApplicationMenuState(updateRequest: MenuUpdateRequest) {
    await this.setMenu(updateRequest);
  }

  private async setMenu(updateRequest?: MenuUpdateRequest) {
    Menu.setApplicationMenu(
      new Menubar(
        this.main.i18nService,
        this.main.messagingService,
        this.main.updaterMain,
        this.windowMain,
        await this.getWebVaultUrl(),
        app.getVersion(),
        updateRequest
      ).menu
    );
  }

  private async getWebVaultUrl() {
    let webVaultUrl = cloudWebVaultUrl;
    const urlsObj: any = await this.main.stateService.getEnvironmentUrls();
    if (urlsObj != null) {
      if (urlsObj.base != null) {
        webVaultUrl = urlsObj.base;
      } else if (urlsObj.webVault != null) {
        webVaultUrl = urlsObj.webVault;
      }
    }
    return webVaultUrl;
  }

  private initContextMenu() {
    if (this.windowMain.win == null) {
      return;
    }

    const selectionMenu = Menu.buildFromTemplate([
      {
        label: this.i18nService.t("copy"),
        role: "copy",
      },
      { type: "separator" },
      {
        label: this.i18nService.t("selectAll"),
        role: "selectAll",
      },
    ]);

    const inputMenu = Menu.buildFromTemplate([
      {
        label: this.i18nService.t("undo"),
        role: "undo",
      },
      {
        label: this.i18nService.t("redo"),
        role: "redo",
      },
      { type: "separator" },
      {
        label: this.i18nService.t("cut"),
        role: "cut",
        enabled: false,
      },
      {
        label: this.i18nService.t("copy"),
        role: "copy",
        enabled: false,
      },
      {
        label: this.i18nService.t("paste"),
        role: "paste",
      },
      { type: "separator" },
      {
        label: this.i18nService.t("selectAll"),
        role: "selectAll",
      },
    ]);

    const inputSelectionMenu = Menu.buildFromTemplate([
      {
        label: this.i18nService.t("cut"),
        role: "cut",
      },
      {
        label: this.i18nService.t("copy"),
        role: "copy",
      },
      {
        label: this.i18nService.t("paste"),
        role: "paste",
      },
      { type: "separator" },
      {
        label: this.i18nService.t("selectAll"),
        role: "selectAll",
      },
    ]);

    this.windowMain.win.webContents.on("context-menu", (e, props) => {
      const selected = props.selectionText && props.selectionText.trim() !== "";
      if (props.isEditable && selected) {
        inputSelectionMenu.popup({ window: this.windowMain.win });
      } else if (props.isEditable) {
        inputMenu.popup({ window: this.windowMain.win });
      } else if (selected) {
        selectionMenu.popup({ window: this.windowMain.win });
      }
    });
  }
}
