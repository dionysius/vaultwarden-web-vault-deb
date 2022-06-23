import { Injectable } from "@angular/core";
import { ipcRenderer } from "electron";

import { ThemingService } from "@bitwarden/angular/services/theming/theming.service";
import { ThemeType } from "@bitwarden/common/enums/themeType";

@Injectable()
export class DesktopThemingService extends ThemingService {
  protected async getSystemTheme(): Promise<ThemeType> {
    return await ipcRenderer.invoke("systemTheme");
  }

  protected monitorSystemThemeChanges(): void {
    ipcRenderer.on("systemThemeUpdated", (_event, theme: ThemeType) =>
      this.updateSystemTheme(theme)
    );
  }
}
