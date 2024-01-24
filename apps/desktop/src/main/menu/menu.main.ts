import { app, Menu } from "electron";

import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";

import { UpdaterMain } from "../updater.main";
import { WindowMain } from "../window.main";

import { MenuUpdateRequest } from "./menu.updater";
import { Menubar } from "./menubar";

const cloudWebVaultUrl = "https://vault.bitwarden.com";

export class MenuMain {
  constructor(
    private i18nService: I18nService,
    private messagingService: MessagingService,
    private environmentService: EnvironmentService,
    private windowMain: WindowMain,
    private updaterMain: UpdaterMain,
  ) {}

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
        this.i18nService,
        this.messagingService,
        this.updaterMain,
        this.windowMain,
        await this.getWebVaultUrl(),
        app.getVersion(),
        updateRequest,
      ).menu,
    );
  }

  private async getWebVaultUrl() {
    return this.environmentService.getWebVaultUrl() ?? cloudWebVaultUrl;
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
